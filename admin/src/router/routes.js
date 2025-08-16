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
    path: path.conciliation,
    name: "conciliation",
    component: MainLayout,
    meta: { title: "conciliations", nav: 1, icon: 'fa-duotone fa-solid fa-books' },
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
    path: path.pending_group,
    name: "pending_group",
    component: MainLayout,
    meta: { title: "Pendientes", nav: 1, icon: 'fa-duotone fa-solid fa-solid fa-clock-rotate-left', children: ['pending_event', 'pending_conciliation'] },
    children: [
      {
        path: "",
        name: "pending_group_index",
        component: () => import("pages/pending/pending-index.vue"),
      }
    ]
  },
  {
    path: path.pending_event,
    name: "pending_event",
    component: MainLayout,
    meta: { title: "events", nav: 1, icon: 'fa-duotone fa-solid fa-calendar-lines' },
    children: [
      {
        path: "",
        name: "pending_event_index",
        component: () => import("pages/pending/pending-event.vue"),
      },
    ],
  },
  {
    path: path.pending_conciliation,
    name: "pending_conciliation",
    component: MainLayout,
    meta: { title: "conciliations", nav: 1, icon: 'fa-duotone fa-solid fa-books' },
    children: [
      {
        path: "",
        name: "pending_conciliation_index",
        component: () => import("pages/pending/pending-conciliation.vue"),
      },
    ],
  },
  {
    path: path.setting_speciality,
    name: "speciality",
    component: MainLayout,
    meta: { nav: 2, title: "speciality", icon: 'fa-duotone fa-solid fa-stethoscope' },
    children: [
      {
        path: "",
        name: "speciality_index",
        component: () => import("pages/setting/speciality/speciality-index.vue"),
      }
    ]
  },
  {
    path: path.setting_ICD10,
    name: "ICD10",
    component: MainLayout,
    meta: { title: "ICD10", nav: 2, icon: 'fa-duotone fa-solid fa-stethoscope' },
    children: [
      {
        path: "",
        name: "ICD10_index",
        component: () => import("pages/setting/ICD10/ICD10-index.vue"),
      },
    ],
  },
  {
    path: path.setting_CPT,
    name: "CPT",
    component: MainLayout,
    meta: { title: "CPT", nav: 2, icon: 'fa-duotone fa-solid fa-stethoscope' },
    children: [
      {
        path: "",
        name: "CPT_index",
        component: () => import("pages/setting/CPT/CPT-index.vue"),
      },
    ],
  },
  {
    path: path.setting_category,
    name: "category",
    component: MainLayout,
    meta: { title: "category", nav: 2, icon: 'fa-duotone fa-solid fa-list-tree' },
    children: [
      {
        path: "",
        name: "setting_category_index",
        component: () => import("pages/setting/category/category-index.vue"),
      },
    ],
  },
  {
    path: path.setting_poll,
    name: "poll",
    component: MainLayout,
    meta: { title: "poll", nav: 2, icon: 'fa-duotone fa-solid fa-poll-people' },
    children: [
      {
        path: "",
        name: "setting_poll_index",
        component: () => import("pages/setting/poll/poll-index.vue"),
      },
      {
        path: `${path.setting_poll_consult}/:id`,
        name: "setting_poll_consult",
        props: true,
        component: () => import("pages/setting/poll/poll-view.vue"),
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
    path: path.libraries_group,
    name: "libraries_group",
    component: MainLayout,
    meta: { title: "librerias", nav: 1, icon: 'fa-duotone fa-solid fa-books', children: ['speciality', 'ICD10', 'CPT', 'category', 'poll'] },
    children: [
      {
        path: "",
        name: "libraries_group_index",
        component: () => import("pages/setting/speciality/speciality-index.vue"),
      }
    ]
  },

  {
    path: path.setting_log,
    name: "log",
    component: MainLayout,
    meta: { title: "logs", nav: 2, icon: 'fa-duotone fa-rectangle-terminal' },
    children: [
      {
        path: "",
        name: "setting_log_index",
        component: () => import("pages/setting/log/log-index.vue"),
      },
    ],
  },
  {
    path: path.setting_role,
    name: "role",
    component: MainLayout,
    meta: { title: "role", nav: 2, icon: 'fa-duotone fa-solid fa-shield-halved' },
    children: [
      {
        path: "",
        name: "role_index",
        component: () => import("pages/setting/role/role-index.vue"),
      },
    ],
  },
  {
    path: path.setting_accessrole,
    name: "accessrole",
    component: MainLayout,
    meta: { title: "role_access", nav: 2, icon: 'fa-duotone fa-solid fa-key' },
    children: [
      {
        path: "",
        name: "accessrole_index",
        component: () => import("pages/setting/access/accessrole-index.vue"),
      },
    ],
  },
  {
    path: path.setting_permission,
    name: "permission",
    component: MainLayout,
    meta: { title: "permission", nav: 2, icon: 'fa-duotone fa-solid fa-user-group-simple' },
    children: [
      {
        path: "",
        name: "permission_index",
        component: () => import("pages/setting/access/permission-index.vue"),
      },
    ],
  },
  {
    path: path.setting_privilege,
    name: "privilege",
    component: MainLayout,
    meta: { title: "privilege", nav: 2, icon: 'fa-duotone fa-solid fa-lock' },
    children: [
      {
        path: "",
        name: "privilege_index",
        component: () => import("pages/setting/access/privilege-index.vue"),
      },
    ],
  },
  {
    path: path.access_group,
    name: "access_group",
    component: MainLayout,
    meta: { title: "accesos", nav: 1, icon: 'fa-duotone fa-solid fa-building-lock', children: ['user', 'role', 'accessrole', 'privilege', 'permission', 'log'] },
    children: [
      {
        path: "",
        name: "access_group_index",
        component: () => import("pages/setting/log/log-index.vue"),
      }
    ]
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
    path: path.setting,
    name: "setting",
    component: MainLayout,
    meta: { title: "Ajustes", nav: 1, icon: 'fa-duotone fa-solid fa-gears' },
    children: [
      {
        path: '',
        name: "setting_index",
        meta: { title: "Ajustes" },
        component: () => import("pages/setting/general/general-index.vue"),
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
