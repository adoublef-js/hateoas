type CounterProps = {
    value: number;
    href?: string;
};

export const Counter = ({ value }: CounterProps) => {
    return (
        <div>
            <p>counter value {value}</p>
            <button
                hx-get={`/c/${value + 1}`}
                hx-target="closest div"
                hx-swap="outerHTML"
            >
                increment
            </button>
        </div>
    );
};
