/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx } from "deps";

type CounterProps = {
    value: number;
};

export const Counter = ({ value }: CounterProps) => {
    return (
        <div hx-target="this" hx-swap="outerHTML">
            <p>counter value {value}</p>
            <button hx-get={`/number/${value + 1}`}>increment</button>
        </div>
    );
};
