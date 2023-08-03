import { Html, SiteData } from "components/layouts/Html.tsx";
import { Header, Footer } from "components/base/mod.ts";

type GetStartedProps = SiteData;

export function GetStarted(props: GetStartedProps) {
    return (
        <Html {...props.siteData}>
            <Header />
            <main>
                <h1>Welcome, Let's walkthrough!</h1>
                <button hx-post="/p" hx-target="body" hx-swap="outerHTML">
                    complete onboarding
                </button>
                <div>
                    <p>Thank you for signing up! 😊</p>
                    <a href="/i/signout">Sign out</a>
                </div>
            </main>
            <Footer />
        </Html>
    );
}
