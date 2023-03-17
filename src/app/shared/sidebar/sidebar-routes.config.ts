import { RouteInfo } from './sidebar.metadata';

/* Sidebar menu Routes and data 8*/
export const ROUTES: RouteInfo[] = [

    {
        path: 'dashboard', title: 'Dashboard', icon: 'ft-grid', class: '', badge: '',
        badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [
        ]
    },

    {
        path: 'usermanager', title: 'Users', icon: 'ft-users', class: '',
        badge: '', badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [

        ]
    },
    
    

   

      {
        path: 'userchannels', title: 'User Channels', icon: 'ft-instagram', class: 'has-sub',
        badge: '', badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [
            {
                path: 'userchannels', title: 'Active Channels', icon: 'ft-plus-circle', class: '',
                badge: '', badgeClass: '', isExternalLink: false, submenu: []
            },
            {
                path: 'blockedchannels', title: 'Blocked Channels', icon: 'ft-info', class: '',
                badge: '', badgeClass: '', isExternalLink: false, submenu: []
            }
        ]

    },

    {
        path: 'channelmanager', title: 'Admin Channels', icon: 'ft-instagram', class: 'has-sub',
        badge: '', badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [
            {
                path: 'newadminchannel', title: 'Add New', icon: 'ft-plus-circle', class: '',
                badge: '', badgeClass: '', isExternalLink: false, submenu: []
            },
            {
                path: 'channelmanager', title: 'Show All', icon: 'ft-info', class: '',
                badge: '', badgeClass: '', isExternalLink: false, submenu: []
            }
        ]

    },

    {
        path: 'profile', title: 'Profile', icon: 'ft-edit', class: '',
        badge: '', badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [

        ]
    },

    {
        path: 'generalsettings', title: 'Site Settings', icon: 'ft-settings', class: '',
        badge: '', badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [

        ]
    },

    {
        path: 'appsettings', title: 'App Update', icon: 'ft-smartphone', class: '',
        badge: '', badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [

        ]
    },

    {
        path: 'banners', title: 'Site Images', icon: 'ft-home', class: '',
        badge: '', badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [

        ]
    },

    {
        path: 'notificationmanager', title: 'Notification', icon: 'ft-bell', class: '',
        badge: '', badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [

        ]
    },

    {
        path: 'seomanager', title: 'SEO', icon: 'ft-trending-up', class: '', badge: '',
        badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [

        ]
    },
    {
        path: 'helpterms', title: 'Help & Terms', icon: 'ft-help-circle', class: 'has-sub',
        badge: '', badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false, submenu: [
            {
                path: 'newhelpterms', title: 'Add New', icon: 'ft-plus-circle', class: '',
                badge: '', badgeClass: '', isExternalLink: false, submenu: []
            },
            {
                path: 'helpterms', title: 'Show All', icon: 'ft-info', class: '',
                badge: '', badgeClass: '', isExternalLink: false, submenu: []
            },
        ]

    },

];
