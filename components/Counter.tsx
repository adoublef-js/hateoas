import { h } from "deps";

type CounterProps = {
    value: number;
};

export const Counter = ({ value }: CounterProps) => {
    return (
        <div hx-target="this" hx-swap="outerHTML">
            <p>counter value {value}</p>
            <button hx-get={`/numbers/${value}/successor`}>increment</button>
        </div>
    );
};
