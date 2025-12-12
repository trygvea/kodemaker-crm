import { useState } from "react";
import { CompletionCheckbox } from "@/components/completion-checkbox";

function UncompletedCheckbox() {
  const [completed, setCompleted] = useState(false);
  return <CompletionCheckbox completed={completed} onClick={() => setCompleted(!completed)} />;
}

function CompletedCheckbox() {
  const [completed, setCompleted] = useState(true);
  return <CompletionCheckbox completed={completed} onClick={() => setCompleted(!completed)} />;
}

function InteractiveCheckbox() {
  const [completed, setCompleted] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <CompletionCheckbox completed={completed} onClick={() => setCompleted(!completed)} />
      <span className="text-sm text-muted-foreground">
        {completed ? "Completed" : "Uncompleted"} - Click to toggle
      </span>
    </div>
  );
}

function AllStates() {
  const [state1, setState1] = useState(false);
  const [state2, setState2] = useState(true);
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <CompletionCheckbox completed={state1} onClick={() => setState1(!state1)} />
        <span className="text-sm">Uncompleted (hover to see checkmark)</span>
      </div>
      <div className="flex items-center gap-4">
        <CompletionCheckbox completed={state2} onClick={() => setState2(!state2)} />
        <span className="text-sm">Completed - clickable (click to toggle)</span>
      </div>
      <div className="flex items-center gap-4">
        <CompletionCheckbox completed={false} disabled={true} onClick={() => {}} />
        <span className="text-sm text-muted-foreground">Disabled uncompleted</span>
      </div>
      <div className="flex items-center gap-4">
        <CompletionCheckbox completed={true} disabled={true} onClick={() => {}} />
        <span className="text-sm text-muted-foreground">Disabled completed</span>
      </div>
    </div>
  );
}

export default {
  uncompleted: <UncompletedCheckbox />,
  completed: <CompletedCheckbox />,
  interactive: <InteractiveCheckbox />,
  allStates: <AllStates />,
};
