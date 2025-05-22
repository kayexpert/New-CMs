"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMessaging } from "@/contexts/messaging-context";

export function MessagingSettingsLink() {
  const { navigateToSettings } = useMessaging();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigateToSettings('messages')}
            aria-label="Message Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Message Settings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
