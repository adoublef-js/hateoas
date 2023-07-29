/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx } from "deps";

type CounterProps = {
    value: number;
};

export const Counter = ({ value }: CounterProps) => {
    return (
        <div>
            <p>counter value {value}</p>
            <button
                hx-get={`/number/${value + 1}`}
                hx-target="closest div"
                hx-swap="outerHTML"
            >
                increment
            </button>
        </div>
    );
};
