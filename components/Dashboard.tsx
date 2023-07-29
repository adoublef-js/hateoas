/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx } from "deps";
import { BaseLayout } from "components/layouts/BaseLayout.tsx";
import { Counter } from "components/counter/Counter.tsx";

type DashboardProps = {};

export function Dashboard(props: DashboardProps) {
    return (
        <BaseLayout title="Deno 💛 Hateoas">
            <img
                src="/assets/static/images/dinotocat.png"
                alt="Dinotocat"
                height="200"
                style="mix-blend-mode: multiply;"
            />
            <div>
                <p>Thank you for signing up! 😊</p>
                <a href="/i/signout">Sign out</a>
            </div>
            <div>
                <Counter value={0} />
                <Counter value={0} />
            </div>
        </BaseLayout>
    );
}
