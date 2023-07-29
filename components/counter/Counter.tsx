type CounterProps = {
    value: number;
};

export const Counter = ({ value }: CounterProps) => {
    return (
        <div>
            <p>counter value {value}</p>
            <button
                hx-get={`/count/${value + 1}`}
                hx-target="closest div"
                hx-swap="outerHTML"
            >
                increment
            </button>
        </div>
    );
};
