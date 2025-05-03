
# Waiter Link - Platform Admin Documentation

This document provides information about the administration features of the Waiter Link platform.

## Admin Features Overview

The platform includes a comprehensive admin panel with the following capabilities:

### 🧑‍💼 Admin Panel (Internal Backoffice):

* Protected area with exclusive login for platform team members
* List of all registered restaurants with:
  * Restaurant name
  * Manager's name
  * Plan status (active, expired, trial, canceled)
  * Number of active waiters
  * Total reviews and clicks
* Manual editing of restaurant data (name, review link, plan)
* View list of waiters with individual click counts

### 🧾 Export and Reports:

* Export monthly data in CSV:
  * Clicks per waiter
  * Monthly ranking
  * Review evolution
* PDF generation for automatic sending to restaurant owners

### 🧩 Accessibility:

* High contrast texts and accessible fonts
* Screen reader support (aria-labels on buttons and charts)
* Complete responsiveness: mobile, tablet, desktop

### ⚡ Performance:

* Fast loading with local cache for dashboards
* Pagination in long lists of waiters and reviews
* Link and QR Code indexing to avoid duplication

### 🔐 Security:

* Unique tokens per waiter with configurable expiration date
* Protection against spam/crawlers in redirection links
* Access logs to the admin panel and for each click on links

### 📂 Backup:

* Automatic daily backup of data in Supabase Storage
* Manual restoration option via admin panel

## How to Access the Admin Panel

1. Create an admin user (required before first login)
2. Access the admin login page at: `/admin/login`
3. Enter your admin email and password

## Creating Your First Admin User

To create the first admin user, you need to call the create-admin Edge Function with the following parameters:

```json
{
  "email": "your-admin-email@example.com",
  "name": "Your Name",
  "adminKey": "your-admin-creation-key"
}
```

You need to set the `ADMIN_CREATION_KEY` secret in your Supabase project settings to secure this process.

## Admin Sections

- **Dashboard**: Overview of key metrics
- **Restaurants**: Manage all restaurants
- **Exports**: Generate and download reports
- **Backups**: Manage system backups
- **Settings**: Configure system parameters

## Recommended Browser

For the best experience, we recommend using the latest version of Chrome, Firefox, or Safari.

## Support

If you need assistance, contact the development team at support@waiterlink.com.
