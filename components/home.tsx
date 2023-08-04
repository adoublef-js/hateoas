import { Html, SiteData, Header, Footer } from "components/base/mod.ts";

type HomeProps = SiteData;

export function Home(props: HomeProps) {
    return (
        <Html {...props.siteData}>
            <Header />
            <main class="wrapper flow">
                <p>Please log in 🤔</p>
                <a href="/i/signin">Sign in</a>
            </main>
            <Footer />
        </Html>
    );
}
