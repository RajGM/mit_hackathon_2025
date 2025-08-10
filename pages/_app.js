import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps }) {
  <SessionProvider session={session}>
    return <Component {...pageProps} />;
  </SessionProvider>
}
