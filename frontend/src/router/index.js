import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "../stores/authStore.js";

import HomeView from "../views/user/Home.vue";
import ToursView from "../views/user/Tours.vue";
import TourDetailView from "../views/user/TourDetail.vue";
import DestinationsView from "../views/user/Destinations.vue";
import SearchResultView from "../views/user/SearchResult.vue";
import ChatbotView from "../views/user/Chatbot.vue";
import LoginView from "../views/user/Login.vue";
import NotFoundView from "../views/user/NotFound.vue";

import AdminDashboardView from "../views/admin/AdminDashboard.vue";
import AdminToursView from "../views/admin/AdminTours.vue";
import AdminDestinationsView from "../views/admin/AdminDestinations.vue";
import AdminCategoriesView from "../views/admin/AdminCategories.vue";
import AdminAttractionsView from "../views/admin/AdminAttractions.vue";
import AdminItinerariesView from "../views/admin/AdminItineraries.vue";
import RegisterView from "../views/user/Register.vue";
import AdminUsersView from "../views/admin/AdminUsers.vue";
import HistoryView from "../views/user/History.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/tours",
    name: "tours",
    component: ToursView,
  },
  {
    path: "/tours/:id",
    name: "tour-detail",
    component: TourDetailView,
  },
  {
    path: "/destinations",
    name: "destinations",
    component: DestinationsView,
  },
  {
    path: "/search",
    name: "search-results",
    component: SearchResultView,
  },
  {
    path: "/chatbot",
    name: "chatbot",
    component: ChatbotView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/history",
    name: "history",
    component: HistoryView,
    meta: { requiresAuth: true },
  },

  {
    path: "/admin",
    name: "admin-dashboard",
    component: AdminDashboardView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/tours",
    name: "admin-tours",
    component: AdminToursView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/destinations",
    name: "admin-destinations",
    component: AdminDestinationsView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/categories",
    name: "admin-categories",
    component: AdminCategoriesView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/attractions",
    name: "admin-attractions",
    component: AdminAttractionsView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/itineraries",
    name: "admin-itineraries",
    component: AdminItinerariesView,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/users",
    name: "admin-users",
    component: AdminUsersView,
    meta: { requiresAdmin: true },
  },

  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return "/login";
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return "/login";
  }
});

export default router;