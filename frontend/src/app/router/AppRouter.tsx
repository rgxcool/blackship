import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { UniversitiesPage, UniversityDetailPage } from "@/pages/universities";
import { CoursesPage } from "@/pages/courses";
import { ROUTES } from "@/shared/config";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const universitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.universities,
  component: UniversitiesPage,
});

const universityDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.universityDetail,
  component: UniversityDetailPage,
});

const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.courses,
  component: CoursesPage,
});

const routeTree = rootRoute.addChildren([
  universitiesRoute,
  universityDetailRoute,
  coursesRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const AppRouter = () => <RouterProvider router={router} />;
