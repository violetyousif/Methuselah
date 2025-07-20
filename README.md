![Hello, I am Methuselah]

Methuselah is an early-stage web application aimed at advancing research and innovation in longevity and healthspan. Built with **Next.js**, this project is in active development, and the current version represents a work in progress.

---

## 📖 Table of Contents

- [Project Overview](#project-overview)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running Locally](#running-locally)
- [Packages, Libraries, and Tools](#packages-libraries-and-tools)
- [Usernames and Passwords](#usernames-and-passwords)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🧬 Project Overview

Methuselah is a platform designed to explore and promote longevity-related solutions. While still in its infancy, the project leverages modern web technologies to deliver a scalable and user-friendly experience. This repository contains the frontend application, with plans for expanded features and integrations in future iterations.

> **Note:** The current version is a development prototype and does not reflect the final product.

---

## 🛠️ Technologies

- **Frontend Framework:** Next.js ^15.1.0
- **Frontend Languages:** TypeScript, JavaScript, CSS, LESS, Markdown
- **Backend Framework:** Express ^5.1.0 (Node.js)
- **Backend Languages:** JavaScript (ES Modules), JSON
- **Runtime:** Node.js v20+
- **Package Manager:** npm

---

## 🚀 Getting Started

### Prerequisites

To run Methuselah locally, ensure you have the following installed:

- [Node.js (v20 or higher)](https://nodejs.org/)
- npm (included with Node.js)
- Git for cloning the repository
- A code editor ([Visual Studio Code](https://code.visualstudio.com/) preferred)

### Installation

```bash
# Clone the repository
git clone https://github.com/violetyousif/Methuselah.git
cd Methuselah

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

---

### 🛡️ Environment Configuration

1. **Obtain the `.env.example` file**:  
   Contact the project maintainers or refer to the project's Discord server.

2. **Place the `.env.example` file in the root directory** of the project.

3. **Rename it** to `.env.local`:

    ```bash
    mv .env.example .env.local
    ```

4. **Edit `.env.local`** to include any required environment variables. Example variables used in the project:

    ```
    # MongoDB
    MONGODB_URI=your-mongodb-uri

    # HuggingFace API
    HF_API_KEY=your-huggingface-api-key

    # JWT Secret
    JWT_SECRET=your_jwt_secret

    # Email credentials for notifications
    MAIL_USER=your.email@gmail.com
    MAIL_PASS=your_email_password

    # Cypress (testing)
    CYPRESS_PROJECT_ID=your_cypress_project_id
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=your_admin_password
    TEST_USER_EMAIL=test@example.com
    TEST_USER_PASSWORD=your_test_user_password
    ```

   > **Note:** Never commit `.env.local` or any file containing secrets to version control.

---

### 🏃 Running Locally

You will need to run both the frontend and backend servers for full functionality.

**In two separate terminals:**

```bash
# Terminal 1: Start the frontend (from project root)
npm run dev
```

```bash
# Terminal 2: Start the backend
cd backend
npm run start
```
**Other terminal options:**
```bash
## Frontend: 
# To run Cypress (E2E) testing scripts or to test newly created/edited scripts:
npx cypress run  # to run in terminal OR
npx cypress open # to run in cypress external extension
#

# Backend:
# If you want to train the pretraining qa AI (not, this AI was created but not incorporated in current results):
npm run dev:qa   # or use nodemon server.js directly if set up
#
```

Then open your browser and go to:  
[http://localhost:3000](http://localhost:3000)

The application will automatically reload as you make changes to the source code.

---

## 📦 Packages, Libraries, and Tools

**Frontend:**
- [Next.js](https://nextjs.org/) (^15.1.0)
- [React](https://react.dev/) (^18.2.0)
- [Ant Design (antd)](https://ant.design/) (^5.26.4)
- [LESS](http://lesscss.org/)
- [highlight.js](https://highlightjs.org/)
- [TypeScript](https://www.typescriptlang.org/) (^5.7.2)
- [Moment](https://momentjs.com/), [Day.js](https://day.js.org/)
- [Recharts](https://recharts.org/), [react-markdown](https://github.com/remarkjs/react-markdown)

**Backend:**
- [Express.js](https://expressjs.com/) (^5.1.0)
- [Mongoose](https://mongoosejs.com/) (^8.16.3)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/) (^6.15.0)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (^9.0.2)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) (^5.1.1)
- [dotenv](https://github.com/motdotla/dotenv) (^17.2.0)
- [cors](https://www.npmjs.com/package/cors) (^2.8.5)
- [cookie-parser](https://www.npmjs.com/package/cookie-parser) (^1.4.7)
- [nodemailer](https://nodemailer.com/) (^7.0.5)
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) (^7.5.0)
- [@huggingface/inference](https://www.npmjs.com/package/@huggingface/inference) (^4.5.1)
- [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist) (^3.4.120)
- [jsdom](https://www.npmjs.com/package/jsdom) (^26.1.0)
- [tesseract.js](https://github.com/naptha/tesseract.js) (^6.0.1)
- [exceljs](https://www.npmjs.com/package/exceljs) (^4.4.0)
- [csv-parser](https://www.npmjs.com/package/csv-parser) (^3.2.0)
- [multer](https://www.npmjs.com/package/multer), [langchain](https://js.langchain.com/), [ollama](https://www.npmjs.com/package/ollama)
- [validator](https://www.npmjs.com/package/validator) (^13.15.15)

**Testing:**
- [Cypress](https://www.cypress.io/)
- [@testing-library/react](https://testing-library.com/)

**Development Tools:**
- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)
- [nodemon](https://www.npmjs.com/package/nodemon)

---

## 👤 Usernames and Passwords

- **No hardcoded usernames or passwords are present in the codebase.**
- All authentication is managed securely via environment variables and user registration.
- Example environment variables for testing/admin (set in `.env.local`):

    ```
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=your_admin_password
    TEST_USER_EMAIL=test@example.com
    TEST_USER_PASSWORD=your_test_user_password
    ```

- **Default credentials are not provided in the repository.** You must set your own admin and test user credentials in your `.env.local` for local development and testing.
- Admin role is declared in database. If you were given access to the data, there will be a list of some credentials for existing users that you may use.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 📄 License

[MIT](LICENSE)

---

## 📬 Contact

For inquiries, feedback, or to access the .env.example file, please:

Join our [Discord server](https://discord.gg/Wdh53pcw/)
Open an issue on the GitHub repository
Email: hj7083@wayne.edu
