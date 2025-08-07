import MainLayout from "layouts/MainLayout.vue";
import PublicLayout from "layouts/PublicLayout.vue";
import LoginLayout from "layouts/LoginLayout.vue";
import HomePage from "pages/home/home-index.vue";
import LoginPage from "pages/public/LoginPage.vue";
import PasswordPage from "pages/public/PasswordPage.vue";
import InsuredView from "pages/insured/insured-view.vue";
import PollQuality from "pages/setting/poll/poll-quality.vue";
import path from "src/data/path";

export const routes = [
  {
    path: "/iniciar-sesion",
    name: "login",
    component: LoginLayout,
    children: [{ path: "", name: "login_index", component: LoginPage }],
  },
  {
    path: "/cambiar-contrasena",
    name: "password_index",
    component: LoginLayout,
    children: [{ path: "", name: "password_index", component: PasswordPage }],
  },
  {
    path: "/encuesta-de-calidad",
    name: "poll_quality",
    component: PublicLayout,
    children: [{ path: "", name: "poll_quality", component: PollQuality }],
  },
];

export const asyncRoutes = [
  {
    path: path.home,
    name: "home",
    component: MainLayout,
    meta: { title: "Inicio", nav: 1, icon: 'fa-duotone fa-solid fa-objects-column' },
    children: [
      {
        path: "",
        name: "home_index",
        component: HomePage,
      },
    ],
  },
  {
    path: path.insured,
    name: "insured",
    component: MainLayout,
    meta: { title: "insureds", nav: 1, icon: 'fa-duotone fa-solid fa-hospital-user' },
    children: [
      {
        path: "",
        name: "insured_index",
        component: () => import("pages/insured/insured-index.vue"),
      },
      {
        path: `${path.insured_consult}/:id`,
        props: true,
        name: "insured_view",
        component: InsuredView,
      },
    ],
  },
  {
    path: path.policy,
    name: "policy",
    component: MainLayout,
    meta: { title: "policies", nav: 1, icon: 'fa-duotone fa-solid fa-heart-circle-plus' },
    children: [
      {
        path: "",
        name: "policy_index",
        component: () => import("pages/policy/policy-index.vue"),
      },
      {
        path: `${path.policy_consult}/:id`,
        props: true,
        name: "policy_view",
        component: () => import("pages/policy/policy-view.vue"),
      },
    ],
  },
  {
    path: path.event,
    name: "event",
    component: MainLayout,
    meta: { title: "events", nav: 1, icon: 'fa-duotone fa-solid fa-calendar-lines' },
    children: [
      {
        path: "",
        name: "event_index",
        component: () => import("pages/event/event-index.vue"),
      },
      {
        path: `${path.event_consult}/:id`,
        props: true,
        name: "event_view",
        component: () => import("pages/event/event-view.vue"),
      },
    ],
  },
  {
    path: path.itinerary,
    name: "itinerary",
    component: MainLayout,
    meta: { title: "itinerary", nav: 1, icon: 'fa-duotone fa-solid fa-calendar-days' },
    children: [
      {
        path: "",
        name: "itinerary_index",
        component: () => import("pages/itinerary/itinerary-index.vue"),
      }
    ],
  },
  {
    path: path.insurance,
    name: "insurance",
    component: MainLayout,
    meta: { title: "insurances", nav: 2, icon: 'fa-duotone fa-solid fa-folder-medical' },
    children: [
      {
        path: "",
        name: "insurance_index",
        component: () => import("pages/insurance/insurance-index.vue"),
      },
      {
        path: `${path.insurance_consult}/:id`,
        props: true,
        name: "insurance_view",
        component: () => import("pages/insurance/insurance-view.vue"),
      },
    ],
  },
  {
    path: path.doctor,
    name: "doctor",
    component: MainLayout,
    meta: { title: "doctors", nav: 2, icon: 'fa-duotone fa-solid fa-user-doctor' },
    children: [
      {
        path: "",
        name: "doctor_index",
        component: () => import("pages/doctor/doctor-index.vue"),
      },
      {
        path: `${path.doctor_consult}/:id`,
        props: true,
        name: "doctor_view",
        component: () => import("pages/doctor/doctor-view.vue"),
      },
    ],
  },
  {
    path: path.contact,
    name: "contact",
    component: MainLayout,
    meta: { title: "contacts", nav: 2, icon: 'fa-duotone fa-solid fa-address-book' },
    children: [
      {
        path: "",
        name: "contact_index",
        component: () => import("pages/contact/contact-index.vue"),
      },
      {
        path: `${path.contact_consult}/:id`,
        props: true,
        name: "contact_view",
        component: () => import("pages/contact/contact-view.vue"),
      },
    ],
  },
  {
    path: path.provider,
    name: "provider",
    component: MainLayout,
    meta: { title: "Centros", nav: 2, icon: 'fa-duotone fa-solid fa-hospitals' },
    children: [
      {
        path: "",
        name: "provider_index",
        component: () => import("pages/provider/provider-index.vue"),
      },
      {
        path: `${path.provider_consult}/:id`,
        props: true,
        name: "provider_view",
        component: () => import("pages/provider/provider-view.vue"),
      },
    ],
  },
  {
    path: path.provider_group,
    name: "provider_group",
    component: MainLayout,
    meta: { title: "providers", nav: 1, icon: 'fa-duotone fa-solid fa-hospitals', children: ['doctor', 'broker', 'contact', 'lodging', 'insurance', 'provider'] },
    children: [
      {
        path: "",
        name: "provider_group_index",
        component: () => import("pages/provider/provider-index.vue"),
      }
    ]
  },
  {
    path: path.broker,
    name: "broker",
    component: MainLayout,
    meta: { title: "broker", nav: 2, icon: 'fa-duotone fa-solid fa-handshake' },
    children: [
      {
        path: "",
        name: "broker_index",
        component: () => import("pages/broker/broker-index.vue"),
      },
      {
        path: `${path.broker_consult}/:id`,
        props: true,
        name: "broker_view",
        component: () => import("pages/broker/broker-view.vue"),
      },
    ],
  },
  {
    path: path.lodging,
    name: "lodging",
    component: MainLayout,
    meta: { title: "lodging", nav: 2, icon: 'fa-duotone fa-solid fa-hotel' },
    children: [
      {
        path: "",
        name: "lodging_index",
        component: () => import("pages/lodging/lodging-index.vue"),
      },
      {
        path: `${path.lodging_consult}/:id`,
        props: true,
        name: "lodging_view",
        component: () => import("pages/lodging/lodging-view.vue"),
      },
    ],
  },
  {
    path: path.user,
    name: "user",
    component: MainLayout,
    meta: { title: "users", icon: 'fa-duotone fa-solid fa-user-shield' },
    children: [
      {
        path: "",
        name: "user_index",
        component: () => import("pages/user/user-index.vue"),
      },
      {
        path: `${path.user_consult}/:id`,
        props: true,
        name: "user_view",
        component: () => import("pages/user/user-view.vue"),
      },
    ],
  },
  {
    path: path.customer,
    name: "customer",
    component: MainLayout,
    meta: { title: "customers", nav: 1, icon: 'fa-duotone fa-solid fa-address-book' },
    children: [
      {
        path: "",
        name: "customer_index",
        component: () => import("pages/customer/customer-index.vue"),
      },
      {
        path: `${path.customer_consult}/:id`,
        props: true,
        name: "customer_view",
        component: () => import("pages/customer/customer-view.vue"),
      },
    ],
  },
  {
    path: path.file,
    name: "file",
    component: MainLayout,
    meta: { title: "files", nav: 1, icon: 'fa-duotone fa-solid fa-photo-film' },
    children: [
      {
        path: "",
        name: "file_index",
        component: () => import("pages/file/file-index.vue"),
      },
      {
        path: `${path.file_consult}/:id`,
        props: true,
        name: "file_view",
        component: () => import("pages/file/file-view.vue"),
      },
    ],
  },
  {
    path: path.conciliation_group,
    name: "conciliation_group",
    component: MainLayout,
    meta: { title: "conciliations", nav: 1, icon: 'fa-duotone fa-solid fa-hospitals', children: ['conciliation', 'conciliation_report'] },
    children: [
      {
        path: "",
        name: "conciliation_group_index",
        component: () => import("pages/conciliation/conciliation-index.vue"),
      }
    ]
  },
  {
    path: path.conciliation,
    name: "conciliation",
    component: MainLayout,
    meta: { title: "conciliation", nav: 2, icon: 'fa-duotone fa-solid fa-books' },
    children: [
      {
        path: "",
        name: "conciliation_index",
        meta: { title: "conciliation" },
        component: () => import("pages/conciliation/conciliation-index.vue"),
      },
      {
        path: path.conciliation_create,
        name: "conciliation_create",
        props: (route) => route.query,
        component: () => import("pages/conciliation/conciliation-write.vue"),
      },
      {
        path: `${path.conciliation_write}/:id`,
        name: "conciliation_write",
        props: true,
        component: () => import("pages/conciliation/conciliation-write.vue"),
      },
    ],
  },
  {
    path: path.conciliation_report,
    name: "conciliation_report",
    component: MainLayout,
    meta: { title: "Reporte General", nav: 2, icon: 'fa-duotone fa-solid fa-calendar-lines' },
    children: [
      {
        path: "",
        name: "conciliation_report_index",
        meta: { title: "Reporte General" },
        component: () => import("pages/conciliation/conciliation-report.vue"),
      },
    ],
  },
  {
    path: path.task,
    name: "task",
    component: MainLayout,
    meta: { title: "task", nav: 1, icon: 'fa-duotone fa-solid fa-list-check' },
    children: [
      {
        path: "",
        name: "task_index",
        meta: { title: "task" },
        component: () => import("pages/task/task-index.vue"),
      },
      {
        path: `${path.task_consult}/:id`,
        name: "task_view",
        meta: { title: "task" },
        props: true,
        component: () => import("pages/task/task-view.vue"),
      },
    ],
  },
  {
    path: path.chart,
    name: "chart",
    component: MainLayout,
    meta: { nav: 2, title: "Estadísticas", nav: 1, icon: 'fa-duotone fa-solid fa-chart-pie-simple' },
    children: [
      {
        path: "",
        name: "chart_index",
        meta: { title: "Gráfico" },
        component: () => import("pages/chart/chart-index.vue"),
        children: [
          {
            path: path.chart_insured,
            name: "chart_insured_index",
            meta: { title: "insured" },
            component: () => import("pages/chart/chart-insured.vue"),
          },
          {
            path: path.chart_event,
            name: "chart_event_index",
            meta: { title: "event" },
            component: () => import("pages/chart/chart-event.vue"),
          },
          {
            path: path.chart_executive_checkups,
            name: "chart_executive_checkups_index",
            meta: { title: "event" },
            component: () => import("pages/chart/chart-chequeos-ejectivos.vue"),
          },
          {
            path: path.chart_policy,
            name: "chart_policy_index",
            meta: { title: "policies" },
            component: () => import("pages/chart/chart-policy.vue"),
          },
          {
            path: path.chart_conciliation,
            name: "chart_conciliation_index",
            meta: { title: "conciliation" },
            component: () => import("pages/chart/chart-conciliation.vue"),
          },
        ],
      },
    ],
  },
  {
    path: path.setting,
    name: "setting",
    component: MainLayout,
    meta: { title: "Ajustes", nav: 1, icon: 'fa-duotone fa-solid fa-gears' },
    children: [
      {
        path: "",
        name: "setting_index",
        meta: { title: "Ajustes" },
        component: () => import("pages/setting/setting-index.vue"),
        children: [
          {
            path: path.setting_general,
            name: "setting_general_index",
            meta: { title: "general" },
            component: () => import("pages/setting/general/general-index.vue"),
          },
          {
            path: path.setting_file,
            name: "setting_file_index",
            meta: { title: "files" },
            component: () => import("pages/setting/general/file-index.vue"),
          },
          {
            path: path.setting_category,
            name: "setting_category_index",
            meta: { title: "category" },
            component: () =>
              import("pages/setting/category/category-index.vue"),
          },
          {
            path: path.setting_speciality,
            name: "setting_speciality_index",
            meta: { title: "speciality" },
            component: () => import("pages/setting/speciality/speciality-index.vue"),
          },
          {
            path: path.setting_ICD10,
            name: "setting_ICD10_index",
            meta: { title: "ICD10" },
            component: () =>
              import("pages/setting/ICD10/ICD10-index.vue"),
          },
          {
            path: path.setting_ICD10,
            name: "setting_ICD10_index",
            meta: { title: "ICD10" },
            component: () =>
              import("pages/setting/ICD10/ICD10-index.vue"),
          },
          {
            path: path.setting_CPT,
            name: "setting_CPT_index",
            meta: { title: "CPT" },
            component: () =>
              import("pages/setting/CPT/CPT-index.vue"),
          },
          {
            path: path.setting_log,
            name: "setting_log_index",
            meta: { title: "user" },
            component: () => import("pages/setting/log/log-index.vue"),
          },
          {
            path: path.setting_user,
            name: "setting_user_index",
            meta: { title: "user" },
            component: () => import("pages/user/user-index.vue"),
          },
          {
            path: path.setting_role,
            name: "setting_role_index",
            meta: { title: "role" },
            component: () => import("pages/setting/role/role-index.vue"),
          },
          {
            path: path.setting_accessrole,
            name: "setting_accessrole_index",
            meta: { title: "accessrole" },
            component: () =>
              import("pages/setting/access/accessrole-index.vue"),
          },
          {
            path: path.setting_permission,
            name: "setting_permission_index",
            meta: { title: "permission" },
            component: () =>
              import("pages/setting/access/permission-index.vue"),
          },
          {
            path: path.setting_privilege,
            name: "setting_privilege_index",
            meta: { title: "privilege" },
            component: () => import("pages/setting/access/privilege-index.vue"),
          },
          {
            path: path.setting_poll,
            name: "setting_poll_index",
            meta: { title: "poll" },
            component: () => import("pages/setting/poll/poll-index.vue"),
          },
          {
            path: `${path.setting_poll_consult}/:id`,
            name: "setting_poll_consult",
            props: true,
            component: () => import("pages/setting/poll/poll-view.vue"),
          },
          {
            path: path.setting_tool_policy,
            name: "setting_tool_policy",
            props: true,
            component: () => import("pages/setting/tool/tool-policy.vue"),
          },
        ],
      },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    name: "NotFound",
    meta: { nav: 0 },
    component: () => import("pages/ErrorNotFound.vue"),
  },
];
