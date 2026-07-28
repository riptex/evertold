import { Redirect } from "expo-router";

/**
 * Stub entry point. Real logic (resume session → route by role, or land
 * on sign-in) belongs to the auth task — this just picks a default so the
 * three navigators are reachable during development.
 */
export default function Index() {
  return <Redirect href="/(auth)" />;
}
