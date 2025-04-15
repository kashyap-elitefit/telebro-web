# EliteFit.AI - Admin Portal

## Description
EliteFit.AI Admin Portal is available for admin users on the **EliteFit.AI** microsite. It allows admins to manage users, videos, programs, and perform analytics.

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/EliteFitAI/ef-web-admin.git
   cd ef-web-admin
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Deployment
This project is deployed to AWS S3 and CloudFront via GitHub Actions:
- **Staging**: Deployed automatically when a PR is merged or a commit is made into the `master` branch. Access it at [admin.elitefit4you.com](http://admin.elitefit4you.com).
- **Production**: Deployed from GitHub releases. To deploy to production, create a new release in GitHub. Access it at [admin.elitefitforyou.com](http://admin.elitefitforyou.com). For release management, visit the [GitHub Releases page](https://github.com/EliteFitAI/ef-web-admin/releases).

## License
This project is licensed under the **EliteFit Pte Ltd** standard terms and conditions.

---

For any internal documentation or support, refer to the company wiki or contact the development team.

