import { Html, SiteData } from "components/layouts/Html.tsx";
import { Counter } from "components/counter/Counter.tsx";
import { Header, Footer } from "components/base/mod.ts";

type DashboardProps = SiteData;

export function Dashboard(props: DashboardProps) {
    return (
        <Html {...props.siteData}>
            <Header />
            <main class="wrapper flow">
                <header>
                    <h1>Welcome 👋🏿</h1>
                </header>
                <section>
                    <Counter value={0} />
                    <Counter value={0} />
                    <div>
                        <p>Thank you for signing up! 😊</p>
                        <a href="/i/signout">Sign out</a>
                    </div>
                </section>
            </main>
            <Footer />
        </Html>
    );
}
