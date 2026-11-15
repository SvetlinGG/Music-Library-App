import { useLocation } from "react-router";
import ErrorPage from "./ErrorPage";

export default function NotFound({
  title = "Lost in the Abyss",
  message,
}) {
  const { pathname } = useLocation();

  return (
    <ErrorPage
      code="404"
      title={title}
      message={
        message ?? (
          <>
            The page <code className="error-path">{pathname}</code> was never recorded.
            Maybe it was a B-side that got burned in the fire.
          </>
        )
      }
    />
  );
}
