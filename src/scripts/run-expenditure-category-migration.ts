import { supabase } from "@/lib/supabase";
import { ensureBudgetAllocationCategory, ensureLiabilityPaymentCategory } from "@/lib/ensure-budget-allocation-category";
import fs from 'fs';
import path from 'path';

/**
 * Script to consolidate budget and liability expenditure categories
 * This script:
 * 1. Ensures the standard "Budget Allocation" category exists
 * 2. Ensures the standard "Liability Payment" category exists
 * 3. Updates all budget-related expenditure entries to use the standard "Budget Allocation" category
 * 4. Updates all liability payment entries to use the standard "Liability Payment" category
 * 5. Removes redundant budget-specific categories
 */
async function consolidateExpenditureCategories() {
  try {
    console.log("Starting expenditure category consolidation...");

    // 1. Ensure the standard "Budget Allocation" category exists
    console.log("Ensuring Budget Allocation category exists...");
    const budgetAllocationId = await ensureBudgetAllocationCategory();
    console.log(`Budget Allocation category ID: ${budgetAllocationId}`);

    // 2. Ensure the standard "Liability Payment" category exists
    console.log("Ensuring Liability Payment category exists...");
    const liabilityPaymentId = await ensureLiabilityPaymentCategory();
    console.log(`Liability Payment category ID: ${liabilityPaymentId}`);

    // 3. Update all budget-related expenditure entries to use the standard "Budget Allocation" category
    console.log("Updating budget-related expenditure entries...");
    const { data: budgetUpdated, error: budgetUpdateError } = await supabase.rpc(
      'exec_sql',
      {
        sql_query: `
          UPDATE expenditure_entries
          SET category_id = '${budgetAllocationId}'
          WHERE budget_item_id IS NOT NULL
          AND liability_payment = FALSE
          RETURNING id
        `
      }
    );

    if (budgetUpdateError) {
      console.error("Error updating budget-related expenditure entries:", budgetUpdateError);
      
      // Fallback: Try direct update
      const { data: directBudgetUpdate, error: directBudgetError } = await supabase
        .from('expenditure_entries')
        .update({ category_id: budgetAllocationId })
        .filter('budget_item_id', 'not.is', null)
        .filter('liability_payment', 'eq', false)
        .select('id');
      
      if (directBudgetError) {
        console.error("Direct update of budget-related expenditure entries also failed:", directBudgetError);
      } else {
        console.log(`Updated ${directBudgetUpdate?.length || 0} budget-related expenditure entries`);
      }
    } else {
      console.log(`Updated ${budgetUpdated?.length || 0} budget-related expenditure entries`);
    }

    // 4. Update all liability payment entries to use the standard "Liability Payment" category
    console.log("Updating liability payment expenditure entries...");
    const { data: liabilityUpdated, error: liabilityUpdateError } = await supabase.rpc(
      'exec_sql',
      {
        sql_query: `
          UPDATE expenditure_entries
          SET category_id = '${liabilityPaymentId}'
          WHERE liability_payment = TRUE
          RETURNING id
        `
      }
    );

    if (liabilityUpdateError) {
      console.error("Error updating liability payment expenditure entries:", liabilityUpdateError);
      
      // Fallback: Try direct update
      const { data: directLiabilityUpdate, error: directLiabilityError } = await supabase
        .from('expenditure_entries')
        .update({ category_id: liabilityPaymentId })
        .filter('liability_payment', 'eq', true)
        .select('id');
      
      if (directLiabilityError) {
        console.error("Direct update of liability payment expenditure entries also failed:", directLiabilityError);
      } else {
        console.log(`Updated ${directLiabilityUpdate?.length || 0} liability payment expenditure entries`);
      }
    } else {
      console.log(`Updated ${liabilityUpdated?.length || 0} liability payment expenditure entries`);
    }

    // 5. Get a list of redundant budget-specific categories
    console.log("Finding redundant budget-specific categories...");
    const { data: redundantCategories, error: findError } = await supabase
      .from('expenditure_categories')
      .select('id, name')
      .or('name.like.Budget allocation for %,name.eq.Liability Payments');

    if (findError) {
      console.error("Error finding redundant categories:", findError);
    } else {
      console.log(`Found ${redundantCategories?.length || 0} redundant categories`);
      
      if (redundantCategories && redundantCategories.length > 0) {
        console.log("Redundant categories:", redundantCategories.map(c => c.name).join(", "));
        
        // Check if any of these categories are still in use
        for (const category of redundantCategories) {
          const { count, error: countError } = await supabase
            .from('expenditure_entries')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', category.id);
          
          if (countError) {
            console.error(`Error checking if category ${category.name} is in use:`, countError);
          } else if (count && count > 0) {
            console.log(`Category ${category.name} is still in use by ${count} entries - skipping deletion`);
          } else {
            // Delete the category if it's not in use
            console.log(`Deleting unused category: ${category.name}`);
            const { error: deleteError } = await supabase
              .from('expenditure_categories')
              .delete()
              .eq('id', category.id);
            
            if (deleteError) {
              console.error(`Error deleting category ${category.name}:`, deleteError);
            } else {
              console.log(`Successfully deleted category: ${category.name}`);
            }
          }
        }
      }
    }

    console.log("Expenditure category consolidation completed successfully!");
  } catch (error) {
    console.error("Error in consolidateExpenditureCategories:", error);
  }
}

// Run the script
consolidateExpenditureCategories();
