import { BaseLayout } from "components/layouts/BaseLayout.tsx";

type HomeProps = {};

export function Home(props: HomeProps) {
    return (
        <BaseLayout title="Deno 💛 Hateoas">
            <div>
                <img
                    src="/assets/static/images/dinotocat.png"
                    alt="Dinotocat"
                    height="200"
                    style="mix-blend-mode: multiply;"
                />
                <div>
                    <p>Please log in 🤔</p>
                    <a href="/i/signin">Sign in</a>
                </div>
            </div>
        </BaseLayout>
    );
}
