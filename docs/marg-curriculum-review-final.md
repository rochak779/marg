# Marg Curriculum — Full Content Review Doc

Auto-generated from `content/curriculum.generated.json`. This is the source of truth used by the app — nothing here has been rewritten or paraphrased.

## Modules

- [Module 1:How Software Actually works  
- [Module 2: From Asking AI to Directing AI](#module-1:-from-asking-ai-to-directing-ai)  
- [Module 3: Customer Feedback: From Comments to Evidence-Backed Insights](#module-2:-customer-feedback:-from-comments-to-evidence-backed-insights)  
- [Module 4: Feature Requests: Classify, Prioritise and Route Work](#module-3:-feature-requests:-classify,-prioritise-and-route-work)  
- [Module 5: Product Communication: Turn Messy Inputs into Clear Updates](#module-4:-product-communication:-turn-messy-inputs-into-clear-updates)  
- [Module 6: AI Prototyping: Turn an Idea into Testable Behaviour](#module-5:-ai-prototyping:-turn-an-idea-into-testable-behaviour)

---

## **Module 1: How Software Actually Works**

## **Audience:** Basic learners only {#module-1:-from-asking-ai-to-directing-ai}

## **Outcome:** By Sunday, the learner can use one reusable mental model to explain how a modern software product works — from what the user sees, to how systems communicate, where information is stored, how access is controlled, and where software runs. {#module-1:-from-asking-ai-to-directing-ai}

## **Week at a glance:** {#module-1:-from-asking-ai-to-directing-ai}

* ## Monday: Frontend vs backend {#module-1:-from-asking-ai-to-directing-ai}

* ## Tuesday: APIs, requests, responses and JSON {#module-1:-from-asking-ai-to-directing-ai}

* ## Wednesday: Databases, tables and SQL {#module-1:-from-asking-ai-to-directing-ai}

* ## Thursday: Authentication, authorization and integrations {#module-1:-from-asking-ai-to-directing-ai}

* ## Friday: Cloud, environments, deployment and logs {#module-1:-from-asking-ai-to-directing-ai}

* ## Saturday: Map a real product flow {#module-1:-from-asking-ai-to-directing-ai}

* ## Sunday: Apply the mental model to a new product experience {#module-1:-from-asking-ai-to-directing-ai}

## ---

 {#module-1:-from-asking-ai-to-directing-ai}

### **Monday (lesson): Frontend vs backend — what runs where?**

## *Estimated time: 10 min* {#module-1:-from-asking-ai-to-directing-ai}

## **Hook:** You tap “View Order” in a shopping app and immediately see your order details. It looks like one simple action, but different parts of the software are responsible for what you see and what happens behind the screen. {#module-1:-from-asking-ai-to-directing-ai}

## **Theory:** {#module-1:-from-asking-ai-to-directing-ai}

* ## The **frontend** is the part of a software product that the user sees and interacts with. It includes screens, buttons, forms, menus, text, images and other user-facing elements. {#module-1:-from-asking-ai-to-directing-ai}

* ## The frontend usually runs on the user's device, such as a mobile phone or web browser. When a user taps “View Order,” the screen and interaction are handled by the frontend. {#module-1:-from-asking-ai-to-directing-ai}

* ## The **backend** is the server-side part of the application. It handles work behind the scenes, such as applying business rules, retrieving information, updating information and communicating with other services. {#module-1:-from-asking-ai-to-directing-ai}

* ## A useful mental model is: **frontend \= what the user interacts with; backend \= server-side work that supports the experience.** {#module-1:-from-asking-ai-to-directing-ai}

* ## These parts usually have different technical ownership. Frontend engineers primarily work on the user-facing application, while backend engineers primarily work on server-side services and logic. {#module-1:-from-asking-ai-to-directing-ai}

* ## A feature can have a frontend that is ready while its backend is still being built. In that situation, the screen may exist, but it cannot yet retrieve the required information or perform the required server-side action. {#module-1:-from-asking-ai-to-directing-ai}

## **Example:** A shopping app may already have a finished “Order History” screen. However, if the backend service that retrieves previous orders is not ready, the screen may exist without being able to display the user's orders. {#module-1:-from-asking-ai-to-directing-ai}

## **Action:** Pick one app you use regularly. Write down two things you can see or interact with and one thing the backend probably needs to do to make that experience work. {#module-1:-from-asking-ai-to-directing-ai}

## **Saved component:** A simple two-column mental model: **Frontend — what the user sees and interacts with** / **Backend — what happens behind the screen**. {#module-1:-from-asking-ai-to-directing-ai}

## **Quiz:** {#module-1:-from-asking-ai-to-directing-ai}

1. ## A user taps “View Order” in a shopping app. Which component primarily controls what the user sees and interacts with on the screen? {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ Frontend {#module-1:-from-asking-ai-to-directing-ai}

* ## — Database {#module-1:-from-asking-ai-to-directing-ai}

* ## — Deployment environment {#module-1:-from-asking-ai-to-directing-ai}

* ## — Backend {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* The frontend is the user-facing part of the application. It controls screens, buttons and other elements the user interacts with. {#module-1:-from-asking-ai-to-directing-ai}

2. ## The app screen is working, but when a user opens their order history, no orders appear because the server-side service is failing. Which part of the system is most likely causing the problem? {#module-1:-from-asking-ai-to-directing-ai}

* ## — Screen layout {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ Backend {#module-1:-from-asking-ai-to-directing-ai}

* ## — Button colour {#module-1:-from-asking-ai-to-directing-ai}

* ## — Font library {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* The screen is working, but the server-side service responsible for retrieving the information is failing. That points to the backend. {#module-1:-from-asking-ai-to-directing-ai}

3. ## An engineer tells a PM: “The frontend is finished, but the backend endpoint is not ready.” What does this most likely mean? {#module-1:-from-asking-ai-to-directing-ai}

* ## — The product cannot ever be deployed {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ The screen can exist, but it cannot yet obtain the required server-side data or action {#module-1:-from-asking-ai-to-directing-ai}

* ## — The application has no visual design {#module-1:-from-asking-ai-to-directing-ai}

* ## — The database has permanently lost all information {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* The frontend can be built before the backend capability is ready. The screen may exist, but it cannot yet communicate with the required server-side functionality. {#module-1:-from-asking-ai-to-directing-ai}

## ---

 {#module-1:-from-asking-ai-to-directing-ai}

### **Tuesday (lesson): APIs, requests, responses and JSON — how systems communicate**

## *Estimated time: 10 min* {#module-1:-from-asking-ai-to-directing-ai}

## **Hook:** The frontend needs information from the backend. But how does one software system actually ask another system for something? {#module-1:-from-asking-ai-to-directing-ai}

## **Theory:** {#module-1:-from-asking-ai-to-directing-ai}

* ## An **API**, or Application Programming Interface, provides a defined way for software systems to communicate. {#module-1:-from-asking-ai-to-directing-ai}

* ## An API can be thought of as a communication doorway between systems. It defines how one system can request information or an action from another system. {#module-1:-from-asking-ai-to-directing-ai}

* ## When a mobile app asks the backend for an order, the message it sends is commonly called a **request**. {#module-1:-from-asking-ai-to-directing-ai}

* ## The information returned by the backend is commonly called a **response**. {#module-1:-from-asking-ai-to-directing-ai}

* ## A request might conceptually say: “Give me order 4821.” The response might contain the order's ID, status and other relevant information. {#module-1:-from-asking-ai-to-directing-ai}

* ## APIs do not guarantee that the other system will always work. A service can be unavailable, slow or return an error. The API simply provides the defined way for the systems to communicate. {#module-1:-from-asking-ai-to-directing-ai}

* ## Software also needs a structured way to represent information. **JSON**, which stands for JavaScript Object Notation, is one common format used to represent structured data. {#module-1:-from-asking-ai-to-directing-ai}

* ## For example: {#module-1:-from-asking-ai-to-directing-ai}

  ## {

##                 "orderId": 4821,

##                 "status": "Delivered"

##              } {#module-1:-from-asking-ai-to-directing-ai}

## This represents two pieces of information: the order ID is 4821 and the status is Delivered. {#module-1:-from-asking-ai-to-directing-ai}

* ## JSON is not the database and it does not decide what should happen to an order. It is simply a structured format for representing data. {#module-1:-from-asking-ai-to-directing-ai}

## **Example:** A mobile app sends a request asking for order 4821\. The backend processes the request and returns a response such as { "orderId": 4821, "status": "Delivered" }. The frontend can then use that information to display the order status. {#module-1:-from-asking-ai-to-directing-ai}

## **Action:** Choose one screen from an app you use. Write what information that screen might request from the backend and what information the backend might return. Represent the response using simple JSON. {#module-1:-from-asking-ai-to-directing-ai}

## **Saved component:** A simple communication model: **Request → API → System → Response**. {#module-1:-from-asking-ai-to-directing-ai}

## **Quiz:** {#module-1:-from-asking-ai-to-directing-ai}

4. ## Your product needs to fetch a customer's latest account balance from another service. What is an API primarily providing in this situation? {#module-1:-from-asking-ai-to-directing-ai}

* ## — A visual design for the customer's screen {#module-1:-from-asking-ai-to-directing-ai}

* ## — A guarantee that the external service will never fail {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ A defined way for the two software systems to communicate {#module-1:-from-asking-ai-to-directing-ai}

* ## — A replacement for every database {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* An API provides a defined mechanism through which software systems can communicate and exchange information. {#module-1:-from-asking-ai-to-directing-ai}

5. ## A mobile app sends “Give me order 4821” to the backend, and the backend returns the order details. What are these two messages commonly called? {#module-1:-from-asking-ai-to-directing-ai}

* ## — Login and logout {#module-1:-from-asking-ai-to-directing-ai}

* ## — Frontend and database {#module-1:-from-asking-ai-to-directing-ai}

* ## — Deployment and rollback {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ Request and response {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* The message sent to ask for information is the request, and the information returned by the system is the response. {#module-1:-from-asking-ai-to-directing-ai}

6. ## An API returns { "orderId": 4821, "status": "Delivered" }. What is JSON doing here? {#module-1:-from-asking-ai-to-directing-ai}

* ## — Deciding whether the order should be delivered {#module-1:-from-asking-ai-to-directing-ai}

* ## — Storing every order permanently {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ Providing a structured format for representing the returned data {#module-1:-from-asking-ai-to-directing-ai}

* ## — Authenticating the customer automatically {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* JSON is a structured format for representing data. It does not make the business decision, permanently store the data or authenticate the user. {#module-1:-from-asking-ai-to-directing-ai}

## ---

 {#module-1:-from-asking-ai-to-directing-ai}

### **Wednesday (lesson): Databases, tables and the basic SQL mental model — where information lives**

## *Estimated time: 10 min* {#module-1:-from-asking-ai-to-directing-ai}

## **Hook:** Yesterday, the application could ask the backend for information. But where does that information actually live so the system can retrieve it later? {#module-1:-from-asking-ai-to-directing-ai}

## **Theory:** {#module-1:-from-asking-ai-to-directing-ai}

* ## A **database** is a system used to store and retrieve information. Applications use databases to persist information so it can be accessed later. {#module-1:-from-asking-ai-to-directing-ai}

* ## A product may store information such as customer names, account IDs, orders, products, payments and subscription plans in databases. {#module-1:-from-asking-ai-to-directing-ai}

* ## One common way of organising information in a database is through **tables**. {#module-1:-from-asking-ai-to-directing-ai}

* ## A table contains **rows** and **columns**. A row represents a record, while a column represents a type of information about that record. {#module-1:-from-asking-ai-to-directing-ai}

* ## For example, a customer table might contain:   {#module-1:-from-asking-ai-to-directing-ai}

| customer\_id | name | plan |
| ----- | ----- | ----- |
| 101 | Priya | Premium |
| 102 | Rahul | Basic |
| 103 | Ananya | Premium |

## 

|  |  |  |
| ----- | ----- | ----- |
|  |  |  |
|  |  |  |
|  |  |  |

* ## A **unique customer ID** gives the system a reliable way to distinguish one customer record from another. Two customers can have the same name, but their IDs can still be different. {#module-1:-from-asking-ai-to-directing-ai}

* ## SQL stands for **Structured Query Language**. It is commonly used to work with relational databases. {#module-1:-from-asking-ai-to-directing-ai}

* ## At a basic level, a database query is a request for specific information from stored data using defined conditions. {#module-1:-from-asking-ai-to-directing-ai}

* ## For example, a PM might ask: “How many customers completed onboarding last week?” An analyst could use a database query to retrieve the relevant records. {#module-1:-from-asking-ai-to-directing-ai}

* ## A useful mental model is: **database \= stored information; table \= organised records; query \= request for specific information.** {#module-1:-from-asking-ai-to-directing-ai}

* ## The frontend does not necessarily communicate directly with the database. A common conceptual flow is: {#module-1:-from-asking-ai-to-directing-ai}

## **Frontend → API → Backend → Database** {#module-1:-from-asking-ai-to-directing-ai}

## The backend can retrieve information from the database and return the relevant result to the frontend. {#module-1:-from-asking-ai-to-directing-ai}

## **Example:** A customer opens their subscription page. The frontend requests the subscription information through an API. The backend retrieves the customer's subscription record from the database and returns the relevant information. {#module-1:-from-asking-ai-to-directing-ai}

## **Action:** Imagine you are designing a simple food delivery app. Create three imaginary tables: Customers, Orders and Restaurants. Write three or four pieces of information each table might store. {#module-1:-from-asking-ai-to-directing-ai}

## **Saved component:** A database mental model showing **Database → Tables → Records → Queries**. {#module-1:-from-asking-ai-to-directing-ai}

## **Quiz:** {#module-1:-from-asking-ai-to-directing-ai}

7. ## A PM asks, “Where are customer names, account IDs and subscription plans usually persisted so the application can retrieve them later?” Which component is the best answer? {#module-1:-from-asking-ai-to-directing-ai}

* ## — Browser tab {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ Database {#module-1:-from-asking-ai-to-directing-ai}

* ## — API request {#module-1:-from-asking-ai-to-directing-ai}

* ## — Frontend button {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* A database is used to persist information so that applications can retrieve it later. {#module-1:-from-asking-ai-to-directing-ai}

8. ## In a customer table, why is a unique customer ID useful? {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ It lets the system reliably distinguish one customer record from another {#module-1:-from-asking-ai-to-directing-ai}

* ## — It automatically encrypts all customer information {#module-1:-from-asking-ai-to-directing-ai}

* ## — It prevents the application from ever having bugs {#module-1:-from-asking-ai-to-directing-ai}

* ## — It guarantees every customer's name is unique {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* A unique ID gives the system a reliable way to identify a specific record, even when multiple customers have the same name. {#module-1:-from-asking-ai-to-directing-ai}

9. ## A PM asks an analyst, “How many customers completed onboarding last week?” At a conceptual level, what does a database query do? {#module-1:-from-asking-ai-to-directing-ai}

* ## — Creates a new AI model {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ Requests specific information from stored data using defined conditions {#module-1:-from-asking-ai-to-directing-ai}

* ## — Redesigns the onboarding interface {#module-1:-from-asking-ai-to-directing-ai}

* ## — Deploys a new version of the product {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* A query asks the database for particular information based on specified conditions. {#module-1:-from-asking-ai-to-directing-ai}

## ---

 {#module-1:-from-asking-ai-to-directing-ai}

### **Thursday (lesson): Authentication vs authorization \+ integrations — who are you and what can you do?**

## *Estimated time: 10 min* {#module-1:-from-asking-ai-to-directing-ai}

## **Hook:** You successfully log in to a product, but you still cannot open the Admin Dashboard. How does the system know who you are and what you are allowed to access? {#module-1:-from-asking-ai-to-directing-ai}

## **Theory:** {#module-1:-from-asking-ai-to-directing-ai}

* ## **Authentication** answers the question: **“Who are you?”** {#module-1:-from-asking-ai-to-directing-ai}

* ## When a user enters an email and password, the system checks whether those credentials identify the user correctly. Other authentication methods can include one-time passwords, passkeys, authentication apps or biometrics. {#module-1:-from-asking-ai-to-directing-ai}

* ## **Authorization** answers the question: **“What are you allowed to do?”** {#module-1:-from-asking-ai-to-directing-ai}

* ## A user can be successfully authenticated but still have limited permissions. {#module-1:-from-asking-ai-to-directing-ai}

* ## For example, an employee may be allowed to view orders, while an administrator may also be allowed to manage users and access an admin dashboard. {#module-1:-from-asking-ai-to-directing-ai}

* ## The easiest way to remember the difference is: {#module-1:-from-asking-ai-to-directing-ai}

  * ## **Authentication \= who are you?** {#module-1:-from-asking-ai-to-directing-ai}

  * ## **Authorization \= what can you do?** {#module-1:-from-asking-ai-to-directing-ai}

* ## Modern products also commonly depend on other software services. When one product connects to another service so that they can work together, this is an **integration**. {#module-1:-from-asking-ai-to-directing-ai}

* ## Examples include: {#module-1:-from-asking-ai-to-directing-ai}

  * ## A payment provider processing payments {#module-1:-from-asking-ai-to-directing-ai}

  * ## A messaging provider sending WhatsApp messages {#module-1:-from-asking-ai-to-directing-ai}

  * ## A mapping service displaying locations {#module-1:-from-asking-ai-to-directing-ai}

  * ## An email provider sending emails {#module-1:-from-asking-ai-to-directing-ai}

* ## An integration allows a product to use a capability provided by another service. It does not mean that the external service replaces the entire backend. {#module-1:-from-asking-ai-to-directing-ai}

* ## For example, after an order ships, a product might communicate with an external messaging provider through an API to send a WhatsApp message to the customer. {#module-1:-from-asking-ai-to-directing-ai}

## **Example:** A user logs into a company's application. Authentication confirms their identity. Authorization checks whether their role allows access to the Admin Dashboard. The application may then integrate with an external payroll service to retrieve salary information. {#module-1:-from-asking-ai-to-directing-ai}

## **Action:** Think about an app you use. Identify one example of authentication, one example of authorization and one external service the app might integrate with. {#module-1:-from-asking-ai-to-directing-ai}

## **Saved component:** A three-part mental model: **Authentication \= Who are you? / Authorization \= What can you do? / Integration \= Which other service is involved?** {#module-1:-from-asking-ai-to-directing-ai}

## **Quiz:** {#module-1:-from-asking-ai-to-directing-ai}

10. ## A user enters an email and password and the system checks whether they are really that user. What concept does this describe? {#module-1:-from-asking-ai-to-directing-ai}

* ## — Authorization {#module-1:-from-asking-ai-to-directing-ai}

* ## — Deployment {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ Authentication {#module-1:-from-asking-ai-to-directing-ai}

* ## — Data aggregation {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* Authentication is the process of establishing or verifying who the user is. {#module-1:-from-asking-ai-to-directing-ai}

11. ## A user is successfully logged in but is prevented from opening the company's admin dashboard because they are not an administrator. What concept is being applied? {#module-1:-from-asking-ai-to-directing-ai}

* ## — Frontend rendering {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ Authorization {#module-1:-from-asking-ai-to-directing-ai}

* ## — Authentication {#module-1:-from-asking-ai-to-directing-ai}

* ## — Database indexing {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* The user has already been authenticated, but the system is checking what they are allowed to access. That is authorization. {#module-1:-from-asking-ai-to-directing-ai}

12. ## Your product automatically sends a WhatsApp message through an external messaging provider after an order ships. From the product's perspective, what is this best described as? {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ An integration with an external service {#module-1:-from-asking-ai-to-directing-ai}

* ## — A database schema {#module-1:-from-asking-ai-to-directing-ai}

* ## — A user-interface theme {#module-1:-from-asking-ai-to-directing-ai}

* ## — A replacement for the product's entire backend {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* The product is connecting to another service to use its messaging capability. This is an integration. {#module-1:-from-asking-ai-to-directing-ai}

## ---

 {#module-1:-from-asking-ai-to-directing-ai}

### **Friday (lesson): Cloud, environments, deployment and logs — where software runs**

## *Estimated time: 10 min* {#module-1:-from-asking-ai-to-directing-ai}

## **Hook:** An engineer tells you, “The fix is written and tested, but it hasn't been deployed to production yet.” Does that mean customers already have the fix? {#module-1:-from-asking-ai-to-directing-ai}

## No. {#module-1:-from-asking-ai-to-directing-ai}

## Understanding where software runs and how changes reach customers is an important part of a PM's technical mental model. {#module-1:-from-asking-ai-to-directing-ai}

## **Theory:** {#module-1:-from-asking-ai-to-directing-ai}

* ## An **environment** is a place where a version of software runs. {#module-1:-from-asking-ai-to-directing-ai}

* ## Software teams commonly maintain separate environments for different purposes. {#module-1:-from-asking-ai-to-directing-ai}

* ## **Development** is where engineers build and change the product. {#module-1:-from-asking-ai-to-directing-ai}

* ## **Staging** is commonly used to test changes in an environment closer to the live product. {#module-1:-from-asking-ai-to-directing-ai}

* ## **Production** is the live environment used by real customers. {#module-1:-from-asking-ai-to-directing-ai}

* ## Teams maintain separate environments so they can build and test changes away from real users before releasing them to production. {#module-1:-from-asking-ai-to-directing-ai}

* ## **Deployment** means making a version of software available in an environment. {#module-1:-from-asking-ai-to-directing-ai}

* ## If a fix has been written and tested but has not yet been deployed to production, customers using the live product may still experience the old behaviour. {#module-1:-from-asking-ai-to-directing-ai}

* ## Modern software often runs on **cloud infrastructure**, which provides computing resources such as servers, storage, databases and networking over a network. {#module-1:-from-asking-ai-to-directing-ai}

* ## For a PM, the important mental model is not knowing every infrastructure component. It is understanding that software needs an environment in which it runs and that different environments may be used during development and release. {#module-1:-from-asking-ai-to-directing-ai}

* ## Software systems also generate **logs**. Logs are records of events that occur inside an application or service. {#module-1:-from-asking-ai-to-directing-ai}

* ## Logs can record information such as requests, errors, failed operations and service responses. {#module-1:-from-asking-ai-to-directing-ai}

* ## Logs are especially useful when a problem happens in production but cannot be reproduced manually. {#module-1:-from-asking-ai-to-directing-ai}

* ## For example, if customers report intermittent checkout failures, application and service logs may help the engineering team understand what happened during the failed attempts. {#module-1:-from-asking-ai-to-directing-ai}

## **Example:** A checkout fix works in development and staging. The team has tested it but has not deployed it to production. Customers may therefore continue experiencing the old checkout behaviour until the new version is released. {#module-1:-from-asking-ai-to-directing-ai}

## **Action:** Imagine customers report intermittent checkout failures that the team cannot reproduce manually. Write down three pieces of information you would want engineering to investigate. {#module-1:-from-asking-ai-to-directing-ai}

## **Saved component:** A release mental model: **Development → Staging → Production**, plus **Logs → Evidence when something goes wrong**. {#module-1:-from-asking-ai-to-directing-ai}

## **Quiz:** {#module-1:-from-asking-ai-to-directing-ai}

13. ## Why might a software team maintain separate development, staging and production environments? {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ To build and test changes away from real users before releasing them to production {#module-1:-from-asking-ai-to-directing-ai}

* ## — To make frontend and backend mean the same thing {#module-1:-from-asking-ai-to-directing-ai}

* ## — To give every user a different version of the database permanently {#module-1:-from-asking-ai-to-directing-ai}

* ## — To remove the need for testing {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* Separate environments allow teams to develop and test changes before exposing them to real users in production. {#module-1:-from-asking-ai-to-directing-ai}

14. ## Engineering says, “The fix is written and tested, but it hasn't been deployed to production yet.” What does this mean for users of the live product? {#module-1:-from-asking-ai-to-directing-ai}

* ## — They are already guaranteed to have the fix {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ They may still experience the old behaviour until the new version is released to production {#module-1:-from-asking-ai-to-directing-ai}

* ## — Their accounts must all be recreated {#module-1:-from-asking-ai-to-directing-ai}

* ## — The database has necessarily been deleted {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* A fix does not affect production users until the new version containing that fix has been deployed to the production environment. {#module-1:-from-asking-ai-to-directing-ai}

15. ## Customers report intermittent checkout failures, but the team cannot reproduce the problem manually. Which technical information would be especially useful for investigating what happened when the failures occurred? {#module-1:-from-asking-ai-to-directing-ai}

* ## ✅ Application and service logs {#module-1:-from-asking-ai-to-directing-ai}

* ## — The product logo {#module-1:-from-asking-ai-to-directing-ai}

* ## — The roadmap title {#module-1:-from-asking-ai-to-directing-ai}

* ## — The marketing tagline {#module-1:-from-asking-ai-to-directing-ai}

## *Explanation:* Logs can contain records of requests, errors and service activity that occurred when the failures happened, giving engineers evidence to investigate. {#module-1:-from-asking-ai-to-directing-ai}

## ---

 {#module-1:-from-asking-ai-to-directing-ai}

### **Saturday (build): Map how a real software product works**

## *Estimated time: 28 min* {#module-1:-from-asking-ai-to-directing-ai}

## **Outcome:** Use the mental model from Monday–Friday to draw a simple technical map of what might happen when a user opens a food delivery app and checks where their delivery partner is. {#module-1:-from-asking-ai-to-directing-ai}

## This is a guided architecture-mapping exercise, not a coding exercise. {#module-1:-from-asking-ai-to-directing-ai}

## **Practice scenario:** {#module-1:-from-asking-ai-to-directing-ai}

## You are the Product Manager for **Swiggy**. {#module-1:-from-asking-ai-to-directing-ai}

## A user has placed an order. {#module-1:-from-asking-ai-to-directing-ai}

## They open the mobile app and tap: {#module-1:-from-asking-ai-to-directing-ai}

> ## **Track Order** {#module-1:-from-asking-ai-to-directing-ai}

## The app shows the delivery partner's current location on a map. {#module-1:-from-asking-ai-to-directing-ai}

## Your task is to draw a simple picture of what might be happening technically behind the screen. {#module-1:-from-asking-ai-to-directing-ai}

## **Build instructions:** {#module-1:-from-asking-ai-to-directing-ai}

## Start with the user-facing application: {#module-1:-from-asking-ai-to-directing-ai}

## **Mobile App** {#module-1:-from-asking-ai-to-directing-ai}

## The mobile app is the frontend. It displays the order status, map and delivery partner location. {#module-1:-from-asking-ai-to-directing-ai}

## Then ask: {#module-1:-from-asking-ai-to-directing-ai}

> ## How does the app get the information it needs? {#module-1:-from-asking-ai-to-directing-ai}

## Add: {#module-1:-from-asking-ai-to-directing-ai}

## **Mobile App → API** {#module-1:-from-asking-ai-to-directing-ai}

## The API provides a defined way for the app to communicate with backend systems. {#module-1:-from-asking-ai-to-directing-ai}

## Next, add the backend service responsible for handling the order: {#module-1:-from-asking-ai-to-directing-ai}

## **Mobile App → API → Order Service** {#module-1:-from-asking-ai-to-directing-ai}

## The Order Service might determine which order belongs to the customer, the current order status and which delivery partner is assigned. {#module-1:-from-asking-ai-to-directing-ai}

## Now ask: {#module-1:-from-asking-ai-to-directing-ai}

> ## Where might persistent order information be stored? {#module-1:-from-asking-ai-to-directing-ai}

## Add: {#module-1:-from-asking-ai-to-directing-ai}

## **Order Service → Database** {#module-1:-from-asking-ai-to-directing-ai}

## The database might contain information such as: {#module-1:-from-asking-ai-to-directing-ai}

## Order ID: 4821

## Customer ID: 101

## Status: Out for delivery

## Delivery Partner ID: 782 {#module-1:-from-asking-ai-to-directing-ai}

## Now ask: {#module-1:-from-asking-ai-to-directing-ai}

> ## Where might the current delivery partner location come from? {#module-1:-from-asking-ai-to-directing-ai}

## Add: {#module-1:-from-asking-ai-to-directing-ai}

## **Order Service → Delivery Location Service** {#module-1:-from-asking-ai-to-directing-ai}

## The Delivery Location Service might provide information such as: {#module-1:-from-asking-ai-to-directing-ai}

## Delivery Partner ID: 782

## Latitude: 12.9716

## Longitude: 77.5946 {#module-1:-from-asking-ai-to-directing-ai}

## The simplified technical flow is now: {#module-1:-from-asking-ai-to-directing-ai}

## **Mobile App → API → Order Service → Database → Delivery Location Service → API → App** {#module-1:-from-asking-ai-to-directing-ai}

## The exact architecture of a real product may be more complex. The goal is to practise identifying the major components and their responsibilities. {#module-1:-from-asking-ai-to-directing-ai}

## **Learner creates:** {#module-1:-from-asking-ai-to-directing-ai}

## Draw the following flow: {#module-1:-from-asking-ai-to-directing-ai}

## **Mobile App → API → Order Service → Database → Delivery Location Service → API → App** {#module-1:-from-asking-ai-to-directing-ai}

## Then add one sentence explaining the role of each component. {#module-1:-from-asking-ai-to-directing-ai}

## For example: {#module-1:-from-asking-ai-to-directing-ai}

> ## **Mobile App:** The frontend where the customer views the order. {#module-1:-from-asking-ai-to-directing-ai}

> ## **API:** Provides the communication mechanism between the app and backend. {#module-1:-from-asking-ai-to-directing-ai}

> ## **Order Service:** Handles order-related backend logic. {#module-1:-from-asking-ai-to-directing-ai}

> ## **Database:** Stores persistent order information. {#module-1:-from-asking-ai-to-directing-ai}

> ## **Delivery Location Service:** Provides the delivery partner's current location. {#module-1:-from-asking-ai-to-directing-ai}

## **Failure challenge:** {#module-1:-from-asking-ai-to-directing-ai}

## Imagine the delivery partner's location does not appear on the map. {#module-1:-from-asking-ai-to-directing-ai}

## Choose one component that could potentially be responsible. {#module-1:-from-asking-ai-to-directing-ai}

## Then answer: {#module-1:-from-asking-ai-to-directing-ai}

1. ## What might the user experience? {#module-1:-from-asking-ai-to-directing-ai}

2. ## Which component might engineering investigate? {#module-1:-from-asking-ai-to-directing-ai}

3. ## What evidence could help confirm the problem? {#module-1:-from-asking-ai-to-directing-ai}

## For example, if the Delivery Location Service is unavailable, the user might see the order status but not the delivery partner's current location. Engineering might investigate whether the location service is returning data and check service or application logs. {#module-1:-from-asking-ai-to-directing-ai}

## **Checks (definition of done):** {#module-1:-from-asking-ai-to-directing-ai}

* ## The frontend/mobile app is identified. {#module-1:-from-asking-ai-to-directing-ai}

* ## An API is included in the flow. {#module-1:-from-asking-ai-to-directing-ai}

* ## A backend service is identified. {#module-1:-from-asking-ai-to-directing-ai}

* ## The database is included. {#module-1:-from-asking-ai-to-directing-ai}

* ## A separate delivery location service is included. {#module-1:-from-asking-ai-to-directing-ai}

* ## The flow shows information returning to the app. {#module-1:-from-asking-ai-to-directing-ai}

* ## Each component has a clear one-line explanation. {#module-1:-from-asking-ai-to-directing-ai}

* ## The learner identifies at least one possible failure point. {#module-1:-from-asking-ai-to-directing-ai}

* ## The learner explains the possible user impact of that failure. {#module-1:-from-asking-ai-to-directing-ai}

## **Saved component:** Your first software architecture map — a reusable way to break a product experience into frontend, API, backend services, databases and other services. {#module-1:-from-asking-ai-to-directing-ai}

## ---

 {#module-1:-from-asking-ai-to-directing-ai}

### **Sunday (practice): Trace a new product experience**

## *Estimated time: 15 min* {#module-1:-from-asking-ai-to-directing-ai}

## **Challenge:** Without copying Saturday's flow, apply the same mental model to a different product experience. {#module-1:-from-asking-ai-to-directing-ai}

## Imagine you are the Product Manager for a food delivery app. {#module-1:-from-asking-ai-to-directing-ai}

## A customer opens the app and taps: {#module-1:-from-asking-ai-to-directing-ai}

> ## **Reorder** {#module-1:-from-asking-ai-to-directing-ai}

## The app shows their previous orders. {#module-1:-from-asking-ai-to-directing-ai}

## The customer selects a previous order and taps: {#module-1:-from-asking-ai-to-directing-ai}

> ## **Order Again** {#module-1:-from-asking-ai-to-directing-ai}

## The app then confirms that the order has been placed. {#module-1:-from-asking-ai-to-directing-ai}

## Your task is to work out what might happen technically behind this experience. {#module-1:-from-asking-ai-to-directing-ai}

## **Rules:** {#module-1:-from-asking-ai-to-directing-ai}

* ## Start with the user and the mobile app. {#module-1:-from-asking-ai-to-directing-ai}

* ## Include an API in the communication flow. {#module-1:-from-asking-ai-to-directing-ai}

* ## Include a backend service. {#module-1:-from-asking-ai-to-directing-ai}

* ## Show where previous order information could come from. {#module-1:-from-asking-ai-to-directing-ai}

* ## Show how the result gets back to the app. {#module-1:-from-asking-ai-to-directing-ai}

* ## Use the concepts from this week rather than trying to design the exact architecture of a real food delivery company. {#module-1:-from-asking-ai-to-directing-ai}

* ## Keep your diagram at the level of major components rather than technical implementation details. {#module-1:-from-asking-ai-to-directing-ai}

## **Hints:** {#module-1:-from-asking-ai-to-directing-ai}

* ## Ask: What does the frontend need from the backend? {#module-1:-from-asking-ai-to-directing-ai}

* ## Ask: Which service might handle the reorder action? {#module-1:-from-asking-ai-to-directing-ai}

* ## Ask: Where could previous order information be stored? {#module-1:-from-asking-ai-to-directing-ai}

* ## Ask: Does the system need to communicate with another service? {#module-1:-from-asking-ai-to-directing-ai}

* ## Ask: How does the result get back to the user? {#module-1:-from-asking-ai-to-directing-ai}

## **Failure challenge:** {#module-1:-from-asking-ai-to-directing-ai}

## Choose one point in your flow and imagine it fails. {#module-1:-from-asking-ai-to-directing-ai}

## For example: {#module-1:-from-asking-ai-to-directing-ai}

> ## The database does not return the customer's previous order. {#module-1:-from-asking-ai-to-directing-ai}

## Answer: {#module-1:-from-asking-ai-to-directing-ai}

* ## What might the user experience? {#module-1:-from-asking-ai-to-directing-ai}

* ## Which component would you investigate? {#module-1:-from-asking-ai-to-directing-ai}

* ## What information could help the engineering team understand what happened? {#module-1:-from-asking-ai-to-directing-ai}

## **Product decision challenge:** {#module-1:-from-asking-ai-to-directing-ai}

## Imagine engineering tells you: {#module-1:-from-asking-ai-to-directing-ai}

> ## “The reorder API is working, but the restaurant is no longer accepting orders for one of the items.” {#module-1:-from-asking-ai-to-directing-ai}

## As the PM, decide what should happen from the user's perspective. {#module-1:-from-asking-ai-to-directing-ai}

## Consider: {#module-1:-from-asking-ai-to-directing-ai}

* ## What should the user see? {#module-1:-from-asking-ai-to-directing-ai}

* ## Should the entire reorder fail? {#module-1:-from-asking-ai-to-directing-ai}

* ## Could the unavailable item be removed? {#module-1:-from-asking-ai-to-directing-ai}

* ## Should the user be asked to review the order? {#module-1:-from-asking-ai-to-directing-ai}

* ## What information should the user receive? {#module-1:-from-asking-ai-to-directing-ai}

## The goal is not to find one technically correct answer. The goal is to connect a technical limitation to a product experience. {#module-1:-from-asking-ai-to-directing-ai}

## **Reflection questions:** {#module-1:-from-asking-ai-to-directing-ai}

* ## Which part of the technical flow was easiest for you to identify? {#module-1:-from-asking-ai-to-directing-ai}

* ## Which component was hardest to place? {#module-1:-from-asking-ai-to-directing-ai}

* ## When something fails, can you now identify which part of the system might be responsible? {#module-1:-from-asking-ai-to-directing-ai}

* ## Which questions would you ask an engineer before deciding what the user should see? {#module-1:-from-asking-ai-to-directing-ai}

* ## How has your understanding of a “feature” changed after mapping what happens behind the screen? {#module-1:-from-asking-ai-to-directing-ai}

* ## Could you use the same mental model to map another product you use? {#module-1:-from-asking-ai-to-directing-ai}

## **Final mental model:** {#module-1:-from-asking-ai-to-directing-ai}

## A modern software product can be thought of as a collection of components working together: {#module-1:-from-asking-ai-to-directing-ai}

## **User → Frontend → API → Backend Services → Database / Other Services → API → Frontend → User** {#module-1:-from-asking-ai-to-directing-ai}

## A PM does not need to know how to build every component. {#module-1:-from-asking-ai-to-directing-ai}

## The reusable skill is being able to ask: {#module-1:-from-asking-ai-to-directing-ai}

> ## **What does the user do?** {#module-1:-from-asking-ai-to-directing-ai}

> ## **What does the frontend need?** {#module-1:-from-asking-ai-to-directing-ai}

> ## **Which backend service handles it?** {#module-1:-from-asking-ai-to-directing-ai}

> ## **Where does the data come from?** {#module-1:-from-asking-ai-to-directing-ai}

> ## **Does another service need to be involved?** {#module-1:-from-asking-ai-to-directing-ai}

> ## **Who is the user and what are they allowed to do?** {#module-1:-from-asking-ai-to-directing-ai}

> ## **Where does the software run?** {#module-1:-from-asking-ai-to-directing-ai}

> ## **What happens if one part fails?** {#module-1:-from-asking-ai-to-directing-ai}

## By answering these questions, you can reason about the technical shape of a feature without needing to write the underlying code.

##   Module 1: From Asking AI to Directing AI {#module-1:-from-asking-ai-to-directing-ai}

**Audience:** Basic learners only

**Outcome:** By Sunday, the learner can turn messy meeting notes into a clear, reusable set of actions using ChatGPT or Claude, and can explain why the output still needs human review.

**Week at a glance:**

- Monday: AI capability map  
- Tuesday: Prompt goal  
- Wednesday: Context and constraints  
- Thursday: Verification checklist  
- Friday: Reusable prompt structure

### Monday (lesson): AI is a prediction engine, not a knowledgeable colleague

*Estimated time: 10 min*

**Hook:** You ask AI a confident question. It gives a confident answer. The dangerous assumption is that confidence means correctness.

**Theory:**

- Artificial intelligence is a broad name for computer systems that perform tasks we associate with human intelligence, such as recognising patterns, understanding language, making predictions and generating content.  
- Tools such as ChatGPT and Claude are powered by large language models, or LLMs. An LLM has learned patterns from very large amounts of text. When you type a message, it predicts a useful continuation one piece at a time. That is why it can explain, rewrite, classify and summarise language so fluently.  
- An LLM does not automatically know your company, your customers or what happened in yesterday's meeting. It only has the information available in the conversation and any material you provide. It can also produce plausible information that is incorrect. Treat it as a fast pattern assistant, not as an unquestionable source of truth.  
- A useful mental model is: AI proposes; you decide. Use it to accelerate thinking and repetitive language work, while keeping responsibility for facts, judgement and consequences with the human user.

**Example:** Weak expectation: 'AI knows what happened in our meeting.' Better expectation: 'If I give AI accurate meeting notes and clear instructions, it can help organise those notes.'

**Action:** Write down one task where AI could help you work with existing information, and one task where you would not trust it without checking.

**Saved component:** A two-column capability map: 'AI can help' and 'Human must decide'.

**Quiz:**

1. What does an LLM mainly do when it generates a response?  
     
   - — Search every website in real time  
   - ✅ Predict a useful continuation from patterns  
   - — Recall a guaranteed fact database  
   - — Copy one complete stored answer  
   - *Explanation:* LLMs generate language by predicting likely and useful next pieces of text; this does not guarantee factual accuracy.

   

2. Which is the safest way to think about AI at work?  
     
   - ✅ AI proposes; a human decides  
   - — AI is correct when it sounds confident  
   - — AI replaces the need for source material  
   - — AI should make every final decision  
   - *Explanation:* The user remains responsible for checking facts, applying judgement and considering consequences.

   

3. Why might AI struggle with yesterday's internal meeting?  
     
   - — It dislikes meeting notes  
   - — It cannot write summaries  
   - ✅ It may not have the meeting information  
   - — It only works with numbers  
   - *Explanation:* The model needs the relevant notes or source material in the conversation before it can work reliably with them.

---

### Tuesday (lesson): A good prompt begins with a job, not clever wording

*Estimated time: 10 min*

**Hook:** Most weak prompts are not badly written. They are missing a clear job.

**Theory:**

- A prompt is the instruction and information you give an AI. Good prompting is not about discovering a magical sentence. It is about making the task unambiguous.  
- Start by defining four things: the goal, the input, the expected output and the audience. 'Summarise this' leaves many decisions to the model. 'Turn these meeting notes into five actions for the product team' gives it a job.  
- Use an action verb that describes the work: classify, compare, extract, rewrite, challenge, prioritise or summarise. Then state what a successful response must contain.  
- Do not add unnecessary role-play such as 'You are the world's best product manager' unless a perspective genuinely changes the task. Specific information is more useful than dramatic language.

**Example:** Before: 'Summarise these notes.' After: 'From the meeting notes below, extract decisions, action items, owners and deadlines. If an owner or deadline is missing, write Not specified.'

**Action:** Rewrite this vague prompt: 'Help me with my meeting.' Include a goal, input and output.

**Saved component:** A one-sentence goal for Saturday: turn meeting notes into decisions and actions.

**Quiz:**

1. Which prompt gives AI the clearest job?  
     
   - — Help with this  
   - — Make this better  
   - ✅ Extract decisions, actions, owners and deadlines from these notes  
   - — Be brilliant and analyse everything  
   - *Explanation:* It names the action, source and required output.

   

2. What is usually more valuable than elaborate role-play?  
     
   - — More emojis  
   - ✅ Specific task information  
   - — Writing in capital letters  
   - — Calling the AI an expert  
   - *Explanation:* Clear context, constraints and output requirements reduce ambiguity.

   

3. Which item is not part of the four-part prompt foundation taught today?  
     
   - — Goal  
   - — Input  
   - — Audience  
   - ✅ A dramatic persona  
   - *Explanation:* A persona can sometimes help, but goal, input, output and audience are the core foundation.

---

### Wednesday (lesson): Context and constraints turn a generic answer into a useful one

*Estimated time: 10 min*

**Hook:** Two people can use the same AI tool and get very different value. Usually, one has supplied the missing context.

**Theory:**

- Context is the background the model needs to interpret the task: who the audience is, why the work matters, what has already happened and what source material it should use.  
- Constraints define the boundaries. Examples include: use only the notes provided, do not invent owners, keep the answer under 200 words, use plain English, or return the result as a table.  
- An example can show the desired pattern when words alone are ambiguous. One short example of a good action item can be more effective than a long explanation.  
- More context is not always better. Include what changes the answer and remove irrelevant detail. Never paste confidential, personal or commercially sensitive information into an AI tool unless your organisation has approved that use.

**Example:** Context: 'This update is for directors who were not in the meeting.' Constraint: 'Use only the notes. Mark missing information instead of guessing.'

**Action:** Add two constraints to yesterday's meeting prompt: one about unsupported information and one about the response format.

**Saved component:** The context and constraint section of Saturday's prompt.

**Quiz:**

1. Which instruction is a constraint?  
     
   - — The meeting was on Monday  
   - — The audience is the product team  
   - ✅ Do not invent missing owners  
   - — These are meeting notes  
   - *Explanation:* It sets a boundary on what the AI is allowed to do.

   

2. When should you paste confidential customer data into a public AI tool?  
     
   - — Whenever it saves time  
   - ✅ Only when organisational policy and the tool's approved use allow it  
   - — When names are interesting  
   - — Whenever the prompt says private  
   - *Explanation:* A prompt cannot override privacy, security or company policy.

   

3. What kind of context should you include?  
     
   - — Every detail you know  
   - ✅ Only information that can change the answer  
   - — No context at all  
   - — Unrelated examples to make the prompt longer  
   - *Explanation:* Relevant context improves the response; irrelevant information creates noise.

---

### Thursday (lesson): A polished answer can still be wrong

*Estimated time: 10 min*

**Hook:** AI errors are often easy to miss because they arrive in fluent sentences and tidy tables.

**Theory:**

- A hallucination is information generated by AI that is unsupported or incorrect but presented as if it were true. It may invent a fact, owner, deadline, quotation or source.  
- Verification means comparing important claims with the original source. For meeting notes, check every decision, owner and deadline. For research, open the cited source. For calculations, verify the inputs and arithmetic.  
- Risk determines how much checking is needed. A draft headline may need a quick review. A compliance decision, financial figure or customer commitment needs stronger evidence and often an authorised human approver.  
- You can reduce errors by telling AI to distinguish facts from assumptions, quote supporting text, state when information is missing and avoid filling gaps. These steps reduce risk; they do not make the model infallible.

**Example:** The AI writes 'Priya will deliver the prototype by Friday.' The notes say only 'Prototype should be explored.' The owner and deadline are hallucinated.

**Action:** Create a four-item checklist for reviewing an AI-generated meeting summary.

**Saved component:** A verification checklist covering decisions, owners, deadlines and unsupported claims.

**Quiz:**

1. What is an AI hallucination?  
     
   - — A colourful interface  
   - ✅ Unsupported or incorrect information presented as true  
   - — A slow response  
   - — A spelling error made by a user  
   - *Explanation:* Fluent language can make fabricated or unsupported details look credible.

   

2. What should you do with an important AI-generated deadline?  
     
   - — Trust it if it is bold  
   - ✅ Check it against the source  
   - — Assume Friday  
   - — Remove every deadline  
   - *Explanation:* Important claims should be verified against the original information.

   

3. Does asking AI not to hallucinate guarantee accuracy?  
     
   - — Yes, always  
   - — Only in short prompts  
   - ✅ No; it can reduce risk but verification is still needed  
   - — Yes, if the model apologises  
   - *Explanation:* Instructions help, but the user must still review consequential output.

---

### Friday (lesson): A workflow is a repeatable path, not one lucky prompt

*Estimated time: 10 min*

**Hook:** If the result depends on remembering the perfect words every Friday, you have a trick. If the process can be repeated and checked, you have the beginning of a workflow.

**Theory:**

- A workflow is a repeatable sequence that turns an input into an output. A simple AI workflow can include: receive notes, extract information, format the result, check missing details and review before sharing.  
- The workflow does not need to be automated. Reusing a saved prompt and a consistent review checklist is already more reliable than starting from scratch every time.  
- A useful workflow defines five elements: trigger, input, AI task, output and human review. The trigger is when the process begins. The human review step makes ownership explicit.  
- Save prompts as reusable templates with placeholders such as \[PASTE NOTES\] and \[AUDIENCE\]. This makes the process easier to repeat without pretending every input is identical.

**Example:** Trigger: meeting ends. Input: notes. AI task: extract decisions and actions. Output: structured table. Human review: meeting owner checks it before sharing.

**Action:** Write the five elements of Saturday's meeting-notes workflow.

**Saved component:** The complete workflow outline and a reusable prompt template.

**Quiz:**

1. What makes a process a workflow?  
     
   - — It uses a very long prompt  
   - ✅ It follows a repeatable path from input to reviewed output  
   - — It runs without any human  
   - — It uses paid software  
   - *Explanation:* Automation is optional; repeatability and defined steps are essential.

   

2. Which is a useful workflow element?  
     
   - ✅ Human review  
   - — A random writing style  
   - — An unexplained output  
   - — A hidden owner  
   - *Explanation:* The workflow should say who checks the result and when.

   

3. Why use placeholders in a saved prompt?  
     
   - — To make it look technical  
   - ✅ To show what must change for each run  
   - — To stop the AI responding  
   - — To hide the workflow  
   - *Explanation:* Placeholders make a template reusable while keeping variable inputs visible.

---

### Saturday (build): Build your first reusable prompt workflow: meeting notes to actions

*Estimated time: 28 min*

**Outcome:** Use ChatGPT or Claude to turn messy meeting notes into a checked action summary. This is a guided prompting workflow, not an automated system.

**Practice input:**

Meeting: Mobile onboarding review

\- Drop-off appears highest after identity verification, but analytics needs to confirm.

\- Sara suggested shortening the help text. No decision was made.

\- Dev will check event tracking by Thursday.

\- The team agreed to test two versions of the progress indicator. Imran will draft the test plan; no date agreed.

\- Legal wording may need review. Owner not discussed.

\- Next review is 18 September.

**Prompt template given to learner:**

You help me organise meeting notes. Use only the notes I provide.

Create four sections:

1\. Decisions made

2\. Action items in a table with Action, Owner, Deadline and Supporting note

3\. Open questions

4\. Information that needs human review

Rules:

\- Do not invent owners, deadlines or decisions.

\- If information is missing, write 'Not specified'.

\- Keep suggestions separate from confirmed decisions.

\- Every action and decision must include a short supporting phrase from the notes.

\- After the output, list any ambiguous statements you could not classify.

When you are ready, ask me to paste the meeting notes.

\[PASTE MEETING NOTES\]

**Checks (definition of done):**

- [ ] Every claimed decision exists in the notes  
- [ ] Missing owners and dates are marked, not invented  
- [ ] Suggestions are not presented as decisions  
- [ ] The learner saved a reusable prompt  
- [ ] The learner tested at least one missing-information case

---

### Sunday (practice): Adapt it yourself: email thread to decisions and actions

*Estimated time: 15 min*

**Challenge:** Without copying Saturday's instructions word for word, adapt the workflow to turn an email thread into decisions, actions and unresolved questions.

**Rules:**

- Change the input description from meeting notes to an email thread  
- Preserve who said what  
- Do not treat a proposal as an agreed decision  
- Add a field for the date of the latest relevant message  
- Create one test where two people disagree

**Hints:**

- Try adapting this requirement: Change the input description from meeting notes to an email thread  
- Try adapting this requirement: Preserve who said what  
- Try adapting this requirement: Do not treat a proposal as an agreed decision

**Reflection questions:**

- What did you change and why?  
- What mistake did the AI make on the first run?  
- Which part of the workflow still requires a human?  
- Could you run the adapted prompt again next week without rewriting it?

---

## Module 2: Customer Feedback: From Comments to Evidence-Backed Insights {#module-2:-customer-feedback:-from-comments-to-evidence-backed-insights}

**Audience:** Week 2 for basic learners; Week 1 entry point for advanced learners

**Outcome:** By Sunday, the learner can use ChatGPT or Claude to analyse a set of customer comments, connect each insight to evidence and test whether the result is trustworthy.

**Week at a glance:**

- Monday: Grounding rules  
- Tuesday: Retrieval mental model  
- Wednesday: Meaning-based grouping  
- Thursday: Source preparation plan  
- Friday: Evaluation checklist

### Monday (lesson): Grounding: make the answer stand on evidence

*Estimated time: 10 min*

**Hook:** A polished customer insight without supporting feedback is only a plausible opinion.

**Theory:**

- Grounding means requiring an AI response to be based on provided or retrieved source material. In this week, the source is a set of customer comments.  
- A grounded insight should be inspectable. A reviewer should be able to move from the conclusion back to the comments that support it. This is why evidence identifiers and short quotations matter.  
- Grounding does not prove that the source itself is complete or unbiased. Ten comments from unhappy customers do not automatically represent the entire customer base. AI can organise the evidence; it cannot repair a poor research sample.  
- Useful rules include: use only the supplied feedback, separate observation from interpretation, cite comment IDs and say 'insufficient evidence' when the data does not support a conclusion.

**Example:** Unsupported: 'Customers hate onboarding.' Grounded: 'Three of eight comments mention confusion during identity verification: C2, C5 and C8.'

**Action:** Rewrite the unsupported insight so it states the evidence, scope and uncertainty.

**Saved component:** Four grounding rules for Saturday's workflow.

**Quiz:**

1. What makes an AI insight grounded?  
     
   - — It is written confidently  
   - ✅ It can be traced to relevant source material  
   - — It is longer than the feedback  
   - — It contains business jargon  
   - *Explanation:* Grounding connects conclusions to inspectable evidence.

   

2. What should the workflow do when evidence is too weak?  
     
   - — Invent a likely explanation  
   - ✅ Say there is insufficient evidence  
   - — Repeat the claim more strongly  
   - — Remove all source IDs  
   - *Explanation:* Uncertainty should be visible rather than filled with plausible text.

   

3. Does grounding guarantee representative research?  
     
   - — Yes  
   - — Only with quotations  
   - ✅ No; source quality and sampling still matter  
   - — Yes, when the answer is a table  
   - *Explanation:* Grounding limits the model to evidence but does not correct biased or incomplete evidence.

---

### Tuesday (lesson): RAG: retrieve before you generate

*Estimated time: 10 min*

**Hook:** When the source collection becomes too large, the model should not guess which part matters. It needs a retrieval step.

**Theory:**

- RAG stands for retrieval-augmented generation. It describes a pattern: first retrieve relevant source material, then give that material to a language model so it can generate an answer grounded in the retrieved evidence.  
- Think of an open-book exam. Retrieval is finding the right pages; generation is writing the answer using those pages. A good writer with the wrong pages still produces a poor answer.  
- RAG is useful when answers must rely on a changing or private collection such as research reports, policies, customer feedback or product documentation. It is unnecessary for every task.  
- This week's ChatGPT/Claude exercise will imitate the grounded behaviour using a small uploaded or pasted dataset. It will not create a production RAG system or vector database.

**Example:** Question: 'Why are customers abandoning onboarding?' Retrieval selects comments about onboarding; generation produces themes and citations using only those comments.

**Action:** Draw or describe the three stages: user question, relevant evidence, grounded answer.

**Saved component:** A plain-English description of retrieval and generation for the workflow.

**Quiz:**

1. What happens first in RAG?  
     
   - — Generate a final answer  
   - ✅ Retrieve relevant source material  
   - — Design a user interface  
   - — Delete the source  
   - *Explanation:* The retrieved evidence is supplied to the model before it generates the answer.

   

2. Which task is a strong RAG candidate?  
     
   - — Rewrite one sentence  
   - ✅ Answer questions from a changing internal policy collection  
   - — Choose an emoji  
   - — Correct a spelling mistake  
   - *Explanation:* RAG helps when responses need relevant evidence from a larger, changing source collection.

   

3. Will Saturday create a production RAG system?  
     
   - — Yes  
   - ✅ No; it demonstrates grounded behaviour with a small source set  
   - — Yes, including a vector database  
   - — Only if the prompt is long  
   - *Explanation:* The MVP exercise teaches the pattern honestly without claiming that a chat prompt is a deployed RAG application.

---

### Wednesday (lesson): Embeddings and vectors: finding meaning, not just matching words

*Estimated time: 10 min*

**Hook:** A customer can say 'I got stuck proving who I am' without ever using the words 'identity verification'. A keyword search may miss the connection.

**Theory:**

- An embedding is a numerical representation of meaning. The numbers form a vector. Text with similar meaning tends to be represented closer together in this numerical space.  
- Vector search uses this representation to find semantically similar material, even when the wording is different. This is why 'login keeps failing' can be connected with 'cannot access my account'.  
- A vector database stores and searches these representations efficiently. Product managers do not need to calculate the vectors, but they should understand the product behaviour: what content is indexed, what gets retrieved and what happens when retrieval is poor.  
- Semantic similarity is not the same as truth or importance. A similar comment may still be irrelevant to the user's question. Retrieval results need filters, ranking and evaluation.

**Example:** Keyword match looks for 'verification'. Semantic search may also find 'the selfie check kept rejecting me' because the meaning is related.

**Action:** Group three differently worded phrases that mean the same customer problem.

**Saved component:** Two pairs of differently worded but semantically similar feedback statements.

**Quiz:**

1. What is an embedding?  
     
   - — A visual dashboard  
   - ✅ A numerical representation of meaning  
   - — A final AI answer  
   - — A privacy policy  
   - *Explanation:* Embeddings allow systems to compare semantic similarity mathematically.

   

2. Why can vector search outperform keyword search?  
     
   - — It always knows the truth  
   - ✅ It can find similar meanings expressed with different words  
   - — It removes the need for source data  
   - — It writes longer answers  
   - *Explanation:* Semantic representations capture related meaning beyond exact word matches.

   

3. Does semantic similarity prove relevance?  
     
   - — Always  
   - ✅ No; similar items can still be wrong for the question  
   - — Only for customer feedback  
   - — Yes, if stored in a vector database  
   - *Explanation:* Retrieval quality must be evaluated in the context of the user's need.

---

### Thursday (lesson): Chunking and metadata decide what the AI can find

*Estimated time: 10 min*

**Hook:** If you cut a document in the wrong places, the answer may retrieve half a thought and lose the evidence around it.

**Theory:**

- Large source collections are often divided into smaller pieces called chunks before retrieval. A chunk might be a paragraph, a feedback comment, a support ticket or a section of a document.  
- Chunks that are too large can mix unrelated ideas. Chunks that are too small can lose context. For customer feedback, keeping one full comment with its ID and metadata is usually a sensible starting point.  
- Metadata is information about the source, such as date, customer type, product area, geography or research round. It allows retrieval and analysis to filter the evidence instead of mixing everything together.  
- Never split evidence in a way that disconnects a quotation from its source ID. The goal is not merely to help the model answer; it is to make the answer auditable.

**Example:** Useful feedback record: C07 | 14 Aug | New customer | Onboarding | 'The selfie check failed three times.'

**Action:** Turn one paragraph of feedback into a clean record with ID, date, segment, topic and full comment.

**Saved component:** The feedback record format that will be used on Saturday.

**Quiz:**

1. What is chunking?  
     
   - — Deleting difficult feedback  
   - ✅ Dividing source material into retrievable pieces  
   - — Generating a final report  
   - — Changing every comment into one word  
   - *Explanation:* Retrieval systems commonly work with smaller source units rather than an entire collection at once.

   

2. Why keep a source ID with each comment?  
     
   - — To make the table longer  
   - ✅ To trace conclusions back to evidence  
   - — To reveal customer identity  
   - — To improve grammar  
   - *Explanation:* Stable IDs make citations and review possible without exposing personal details.

   

3. What can metadata help the workflow do?  
     
   - ✅ Filter by segment or product area  
   - — Guarantee every conclusion  
   - — Replace the comment text  
   - — Avoid all human review  
   - *Explanation:* Metadata provides useful constraints for retrieval and analysis.

---

### Friday (lesson): Evals: test the workflow, not just the demo

*Estimated time: 10 min*

**Hook:** A workflow that succeeds on one carefully chosen example has shown a demo, not reliability.

**Theory:**

- An evaluation, often shortened to eval, is a structured way to test whether an AI system produces acceptable results. An eval needs an input, an expected behaviour and a way to judge the output.  
- For feedback analysis, useful criteria include evidence coverage, citation accuracy, unsupported claims, correct separation of themes and visibility of uncertainty.  
- Create a small test set containing normal cases and edge cases. Edge cases might include one comment with two themes, contradictory comments, an empty comment or a claim with no supporting evidence.  
- Some checks can be objective, such as whether every cited ID exists. Others require human judgement, such as whether two themes were merged incorrectly. Record both rather than pretending quality is a single automatic score.

**Example:** Test: one comment praises speed but criticises unclear fees. Expected behaviour: preserve both themes rather than labelling the entire comment positive or negative.

**Action:** Write three test cases: a normal comment, a two-theme comment and an irrelevant comment.

**Saved component:** A five-point evaluation checklist and three test cases.

**Quiz:**

1. What does an eval require?  
     
   - — Only a polished output  
   - ✅ Input, expected behaviour and a judgement method  
   - — A vector database  
   - — A public leaderboard  
   - *Explanation:* An eval defines what good behaviour looks like and how it will be checked.

   

2. Which is an edge case for feedback analysis?  
     
   - — A clear single-theme comment  
   - ✅ A comment containing praise and criticism  
   - — A table header  
   - — The workflow title  
   - *Explanation:* Mixed or ambiguous inputs test whether the workflow oversimplifies evidence.

   

3. Can all feedback quality checks be fully automatic?  
     
   - — Yes  
   - ✅ No; some require human judgement  
   - — Only citation checks need humans  
   - — Yes, when using RAG  
   - *Explanation:* Interpretation quality and theme boundaries often need a reviewer.

---

### Saturday (build): Build a grounded customer-feedback analysis workflow

*Estimated time: 35 min*

**Outcome:** Use ChatGPT or Claude to turn a small feedback dataset into themes with traceable evidence. This is a manual, source-grounded workflow inside a chat tool, not a production RAG implementation.

**Practice input:**

C01 | Existing user | Search | 'I can never find last month's saved report.'

C02 | New user | Onboarding | 'The identity check rejected my photo twice and I nearly gave up.'

C03 | Existing user | Reporting | 'Export is fast, but the CSV column names are confusing.'

C04 | New user | Onboarding | 'Setup was quick. The progress indicator helped.'

C05 | Existing user | Search | 'Saved reports disappear from the first page, so I recreate them.'

C06 | Existing user | Reporting | 'I need a PDF for directors; CSV is not enough.'

C07 | New user | Onboarding | 'I did not understand why a selfie was required.'

C08 | Existing user | General | 'The new colours look nice.'

C09 | Existing user | Search | 'Could not locate a report after renaming it.'

C10 | New user | Onboarding | 'Verification worked first time, but I was worried about how the photo would be used.'

**Prompt template given to learner:**

Analyse the customer feedback provided below using only that source material.

Question: What are the most evidenced customer problems, and what should the product team investigate next?

Return:

1\. A theme table with Theme, Description, Number of supporting comments, Comment IDs, Short evidence excerpts and Confidence (High/Medium/Low).

2\. Contradictory or positive evidence that challenges each theme.

3\. Comments that do not provide enough evidence for a product conclusion.

4\. Three investigation questions for the product team.

Rules:

\- Do not invent customers, causes, frequencies or quotations.

\- Do not claim that this small sample represents all customers.

\- A theme needs at least two supporting comments; otherwise label it 'Emerging signal'.

\- Preserve multiple meanings when one comment contains more than one point.

\- Cite comment IDs for every conclusion.

Before answering, confirm how many comments you received.

\[PASTE FEEDBACK RECORDS\]

**Checks (definition of done):**

- [ ] Every theme cites valid comment IDs  
- [ ] Quotations match the source  
- [ ] Small-sample limitations are visible  
- [ ] Contradictory evidence is not hidden  
- [ ] The learner ran at least two edge cases

---

### Sunday (practice): Adapt it yourself: research notes to evidence-backed findings

*Estimated time: 15 min*

**Challenge:** Adapt Saturday's workflow to analyse short research notes rather than customer comments.

**Rules:**

- Replace customer IDs with source-note IDs  
- Separate observed behaviour from participant opinion  
- Add a field for research question  
- Do not count repeated notes from the same participant as separate people  
- Create one note that contradicts the dominant theme

**Hints:**

- Try adapting this requirement: Replace customer IDs with source-note IDs  
- Try adapting this requirement: Separate observed behaviour from participant opinion  
- Try adapting this requirement: Add a field for research question

**Reflection questions:**

- Did every finding remain traceable?  
- What did the AI overgeneralise?  
- Which source-preparation choice improved the result?  
- What would need to change before this could be used with real company research?

---

## Module 3: Feature Requests: Classify, Prioritise and Route Work {#module-3:-feature-requests:-classify,-prioritise-and-route-work}

**Audience:** Applied module for both learner paths

**Outcome:** By Sunday, the learner can create and test a repeatable ChatGPT/Claude workflow that classifies incoming requests, explains its reasoning and sends uncertain items for human review.

**Week at a glance:**

- Monday: Taxonomy  
- Tuesday: Classification criteria  
- Wednesday: Structured schema  
- Thursday: Confidence and review rules  
- Friday: Routing tests

### Monday (lesson): A taxonomy gives AI a shared filing system

*Estimated time: 10 min*

**Hook:** If your categories overlap, AI will not repair them. It will simply make the inconsistency faster.

**Theory:**

- A taxonomy is a defined system of categories. For feature requests, categories might represent product area, request type or customer problem.  
- Good categories are understandable, useful for a decision and as distinct as practical. 'Dashboard', 'Reporting' and 'Better experience' overlap unless each has a definition.  
- Include an Other or Needs review category. Forcing every request into a named category makes the data look tidy while hiding uncertainty.  
- Start with a small taxonomy that supports a real downstream action. Add categories only when repeated evidence shows they are needed.

**Example:** Category: Reporting export. Include requests about PDF, CSV or scheduled export. Exclude requests about finding saved reports; those belong to Search and discovery.

**Action:** Define four categories for a product inbox, including what belongs and what does not.

**Saved component:** A four-category taxonomy plus Needs review.

**Quiz:**

1. What is a taxonomy?  
     
   - — A generated summary  
   - ✅ A defined system of categories  
   - — A model price list  
   - — A design prototype  
   - *Explanation:* A taxonomy creates a shared structure for classification.

   

2. Why include Needs review?  
     
   - — To hide difficult requests  
   - ✅ To make uncertainty visible  
   - — To reduce the number of inputs  
   - — To replace every category  
   - *Explanation:* Some inputs will not fit cleanly and should not be forced.

   

3. Which taxonomy is more useful?  
     
   - — Good/Bad/Interesting  
   - ✅ Defined categories linked to downstream work  
   - — A new category for every ticket  
   - — Categories with no definitions  
   - *Explanation:* A taxonomy should support consistent decisions and actions.

---

### Tuesday (lesson): Classification needs criteria, not vibes

*Estimated time: 10 min*

**Hook:** Two requests can use different words and still belong to the same category. The classifier needs rules for meaning.

**Theory:**

- Classification assigns an input to one or more predefined categories. The quality depends on category definitions, examples and decision rules.  
- Give the model positive examples and difficult boundary examples. A request to 'download a saved report' could involve export or search; the user's actual problem determines the category.  
- Decide whether an item may have more than one label. Multi-label classification can preserve meaning, but it can also create noisy data when used without rules.  
- Require a short evidence phrase from the request. This makes the classification easier to inspect and helps reviewers see whether the model focused on the right words.

**Example:** Request: 'Let me receive a PDF every Monday.' Labels: Reporting export \+ Scheduled delivery. Evidence: 'PDF every Monday'.

**Action:** Write one clear example and one boundary example for each of two categories.

**Saved component:** Classification rules and examples.

**Quiz:**

1. What should drive classification?  
     
   - — The longest word  
   - ✅ Defined meaning and criteria  
   - — The requester's job title only  
   - — Random choice  
   - *Explanation:* The system needs explicit category boundaries and evidence.

   

2. Why request an evidence phrase?  
     
   - — To make outputs longer  
   - ✅ To inspect why the label was chosen  
   - — To hide the source  
   - — To guarantee the model is correct  
   - *Explanation:* Evidence improves traceability but still needs review.

   

3. When is multi-label classification useful?  
     
   - ✅ When an item genuinely contains multiple relevant meanings  
   - — For every input  
   - — When categories have no definitions  
   - — Only for positive feedback  
   - *Explanation:* Multi-label output should preserve real overlap, not become a default escape route.

---

### Wednesday (lesson): Structured output makes AI results usable

*Estimated time: 10 min*

**Hook:** A paragraph can sound smart and still be difficult to sort, compare or pass to another step.

**Theory:**

- Structured output means asking the AI to return information in defined fields. For a request, fields might include ID, category, problem statement, urgency, evidence and recommended owner.  
- A consistent schema makes results easier to review and eventually easier to pass into another tool. The field definitions matter as much as the table itself.  
- Do not confuse format compliance with correctness. A perfectly formatted row can still contain an invented priority or the wrong category.  
- Use allowed values where consistency matters. For example, confidence must be High, Medium or Low rather than any phrase the model chooses.

**Example:** ID: R04 | Category: Reporting export | Confidence: High | Evidence: 'Need PDF download' | Review: No.

**Action:** Create a seven-field output schema for the Saturday workflow.

**Saved component:** The final request-classification schema.

**Quiz:**

1. What is a structured output?  
     
   - — Any long answer  
   - ✅ An answer returned in defined fields  
   - — A colourful answer  
   - — An answer without a source  
   - *Explanation:* Defined fields make results easier to compare, review and reuse.

   

2. Does correct formatting guarantee correct classification?  
     
   - — Yes  
   - ✅ No  
   - — Only in a table  
   - — Only with seven fields  
   - *Explanation:* Structure improves usability, not factual or judgement accuracy.

   

3. Why use allowed values for confidence?  
     
   - ✅ To make comparison consistent  
   - — To remove every uncertainty  
   - — To generate more categories  
   - — To avoid defining confidence  
   - *Explanation:* A controlled set prevents inconsistent labels such as 'fairly sure' and 'almost high'.

---

### Thursday (lesson): Confidence should change what happens next

*Estimated time: 10 min*

**Hook:** A confidence label is decoration unless it changes the workflow.

**Theory:**

- Confidence represents how strongly the available evidence supports a classification. It should be defined using observable conditions, not the model's mood.  
- For example: High means the request clearly matches one category and includes direct evidence; Medium means two categories are plausible; Low means the request is incomplete or outside the taxonomy.  
- Human-in-the-loop means a person reviews or decides at an appropriate point. Low-confidence items, high-impact requests and policy exceptions are common review candidates.  
- The goal is not to remove humans from the process. It is to focus human attention where judgement is most valuable.

**Example:** 'Make reports better' lacks a specific problem. Confidence: Low. Route: Needs clarification, not Reporting backlog.

**Action:** Define High, Medium and Low confidence and attach a next action to each.

**Saved component:** Confidence thresholds and human-review rules.

**Quiz:**

1. When is a confidence label useful?  
     
   - ✅ When it changes the next action  
   - — When every item is High  
   - — When it has no definition  
   - — When reviewers never see it  
   - *Explanation:* Confidence should control routing, review or clarification.

   

2. Which item most likely needs human review?  
     
   - — A clear request matching one category  
   - ✅ An incomplete request matching two categories  
   - — A correctly formatted ID  
   - — A known duplicate  
   - *Explanation:* Ambiguity and missing information reduce confidence.

   

3. What is human-in-the-loop?  
     
   - ✅ A human reviews or decides at a defined point  
   - — A fully manual process with no AI  
   - — A hidden prompt  
   - — A confidence score only  
   - *Explanation:* The workflow explicitly reserves consequential or uncertain decisions for people.

---

### Friday (lesson): Routing turns classification into action

*Estimated time: 10 min*

**Hook:** Sorting a ticket is not the outcome. The outcome is getting it to the right next step.

**Theory:**

- Routing uses classification and rules to decide what happens next. A request may go to a product area, a clarification queue, a duplicate review or a high-impact escalation.  
- Keep classification and priority separate. A request can clearly belong to Reporting but still have unknown urgency. Priority should use defined evidence such as affected users, business impact, risk and strategic fit.  
- Test routing with boundary cases: missing context, multiple categories, emotionally strong wording without evidence, duplicate requests and possible security or legal issues.  
- A good routing output explains the reason and makes escalation visible. It should not silently make irreversible decisions.

**Example:** Category: Access. Security indicator: Possible. Confidence: Medium. Route: Security review before product backlog.

**Action:** Create five IF/THEN routing rules and one rule that always requires human review.

**Saved component:** Routing rules plus a Friday test set.

**Quiz:**

1. What does routing determine?  
     
   - ✅ The next action or destination  
   - — The font used in the output  
   - — Whether the AI is popular  
   - — The length of the source  
   - *Explanation:* Classification becomes useful when it leads to an appropriate next step.

   

2. Are category and priority the same?  
     
   - — Yes  
   - ✅ No; they answer different questions  
   - — Only for urgent tickets  
   - — Only in a spreadsheet  
   - *Explanation:* Category describes what the request concerns; priority evaluates importance using separate evidence.

   

3. Which should trigger special review?  
     
   - ✅ Possible security or legal impact  
   - — A correctly spelled request  
   - — A common category  
   - — A short ticket ID  
   - *Explanation:* Consequential exceptions should be escalated rather than handled as ordinary classification.

---

### Saturday (build): Build a request classification and routing workflow

*Estimated time: 35 min*

**Outcome:** Use ChatGPT or Claude to classify mock product requests, return a structured result and create an exception queue for uncertain or sensitive items.

**Practice input:**

R01 | 'Please let me export the dashboard as PDF.'

R02 | 'I renamed a saved report and now cannot find it.'

R03 | 'Make the homepage nicer.'

R04 | 'Can finance receive a CSV automatically every Monday?'

R05 | 'The app showed another customer's name for one second.'

R06 | 'Add dark mode.'

R07 | 'The selfie check failed, but I do not know whether it was the camera or my connection.'

R08 | 'We need the same dashboard our competitor has.'

**Prompt template given to learner:**

Classify and route each product request using only the request text and the rules below.

Categories:

\- Search and discovery

\- Reporting export

\- Scheduled delivery

\- Onboarding

\- Interface preference

\- Needs review

Confidence:

\- High: one category clearly matches direct evidence

\- Medium: more than one category is plausible

\- Low: the request is vague, incomplete or outside the taxonomy

Return a table with: ID, Category, Customer problem, Evidence phrase, Confidence, Route, Human-review reason.

Routing rules:

\- Low confidence \-\> Clarification queue

\- Medium confidence \-\> Product review

\- High confidence \-\> Named category backlog

\- Any possible privacy, security, legal or customer-data issue \-\> Urgent human review

\- Do not infer priority from emotional wording alone

\- Do not invent customer impact or scale

After the table, list possible duplicates and inputs that need a new category.

\[PASTE REQUESTS\]

**Checks (definition of done):**

- [ ] Every label uses the defined taxonomy  
- [ ] Every row includes evidence  
- [ ] Ambiguous items are not forced  
- [ ] Sensitive items reach human review  
- [ ] The learner distinguishes category from priority

---

### Sunday (practice): Adapt it yourself: support tickets to product signals

*Estimated time: 15 min*

**Challenge:** Adapt the workflow to classify support tickets by issue type and route them either to support, engineering, product review or urgent escalation.

**Rules:**

- Create a new support-ticket taxonomy  
- Preserve the original ticket ID  
- Add a field for reproduction information  
- Escalate possible account or data exposure  
- Test one ticket with two plausible categories

**Hints:**

- Try adapting this requirement: Create a new support-ticket taxonomy  
- Try adapting this requirement: Preserve the original ticket ID  
- Try adapting this requirement: Add a field for reproduction information

**Reflection questions:**

- Which categories overlapped?  
- What information was most often missing?  
- Did confidence lead to the correct next action?  
- Which routes should never be decided by AI alone?

---

## Module 4: Product Communication: Turn Messy Inputs into Clear Updates {#module-4:-product-communication:-turn-messy-inputs-into-clear-updates}

**Audience:** Applied module for both learner paths

**Outcome:** By Sunday, the learner can build a reusable ChatGPT/Claude workflow that converts verified product inputs into different stakeholder updates without inventing progress or hiding risk.

**Week at a glance:**

- Monday: Audience contract  
- Tuesday: Source hierarchy  
- Wednesday: Synthesis rules  
- Thursday: Output templates  
- Friday: Quality checks

### Monday (lesson): The audience changes the answer

*Estimated time: 10 min*

**Hook:** A useful engineering update and a useful executive update may describe the same week without using the same detail.

**Theory:**

- Audience design means deciding what a particular reader needs to know, decide or do. Tone is only one part; relevance and level of detail matter more.  
- Define the reader, purpose, decision and expected length before asking AI to write. An executive may need progress, risk and decisions. A delivery team may need dependencies, owners and next steps.  
- Do not ask AI to make an update 'sound positive' when the real requirement is clarity. The workflow should preserve material risks even when it shortens the source.  
- A useful audience contract says what must always remain and what can be removed. This prevents personalisation from becoming distortion.

**Example:** Executive: outcome, change, risk, decision. Delivery team: completed work, blockers, owner, dependency, next action.

**Action:** Write an audience contract for a director receiving a weekly product update.

**Saved component:** Audience, purpose, required information and length.

**Quiz:**

1. What should be defined before generating an update?  
     
   - — Only the tone  
   - ✅ Reader, purpose, decision and length  
   - — A dramatic persona  
   - — The number of adjectives  
   - *Explanation:* These choices determine relevance and detail.

   

2. What must happen to a material risk in a shorter update?  
     
   - ✅ It should remain visible  
   - — It should be removed  
   - — It should become a success  
   - — It should be replaced by jargon  
   - *Explanation:* Compression must not hide important risk.

   

3. What is an audience contract?  
     
   - — A legal agreement  
   - ✅ A definition of what the reader needs and what must be preserved  
   - — A list of model names  
   - — A hidden system prompt  
   - *Explanation:* It guides useful adaptation without distorting facts.

---

### Tuesday (lesson): Source hierarchy: tell AI what wins when inputs disagree

*Estimated time: 10 min*

**Hook:** The roadmap says launch is Friday. The delivery notes say the security review is unfinished. Which source should the update trust?

**Theory:**

- Product updates often combine metrics, meeting notes, ticket status and informal comments. These sources can conflict or have different levels of authority.  
- A source hierarchy tells the workflow which information is authoritative. For example, verified analytics may outrank an estimate; the current delivery tracker may outrank an old planning document.  
- The workflow should surface conflicts rather than silently choosing the most convenient statement. Ask it to list disagreements and missing evidence before drafting the final update.  
- Give every input a label such as VERIFIED METRIC, DELIVERY STATUS, DECISION LOG or UNCONFIRMED NOTE. Labels make the model's job and the human review clearer.

**Example:** Verified delivery tracker: launch blocked. Old roadmap: launch Friday. Output: 'Launch date at risk; roadmap is not yet updated.'

**Action:** Rank four product sources from most to least authoritative and explain the choice.

**Saved component:** A source hierarchy and conflict rule.

**Quiz:**

1. Why define a source hierarchy?  
     
   - ✅ To decide which source is authoritative when inputs conflict  
   - — To make the prompt longer  
   - — To remove all sources  
   - — To guarantee a launch date  
   - *Explanation:* The workflow needs an explicit rule rather than silently choosing.

   

2. What should AI do with conflicting sources?  
     
   - — Hide the conflict  
   - ✅ Surface it for review  
   - — Choose the most positive statement  
   - — Average the sentences  
   - *Explanation:* Conflicts can be material and need human judgement.

   

3. Which label signals that a statement needs caution?  
     
   - — VERIFIED METRIC  
   - ✅ UNCONFIRMED NOTE  
   - — DECISION LOG  
   - — APPROVED STATUS  
   - *Explanation:* The label prevents speculation from being presented as settled fact.

---

### Wednesday (lesson): Synthesis is selection with accountability

*Estimated time: 10 min*

**Hook:** Summarising removes information. Good synthesis explains what deserves to survive that removal.

**Theory:**

- Summarisation compresses information. Synthesis connects information from several sources to produce a useful view. It may identify progress, dependencies, changes, risks and decisions.  
- A synthesis rule tells AI what to preserve: material changes since last week, blocked outcomes, decisions required and metrics that changed beyond a defined threshold.  
- Ask the model to separate fact, interpretation and recommendation. 'Conversion fell 4%' is a fact if verified. 'Users dislike the new design' is an interpretation unless supported by research.  
- Require traceability for important claims using source labels. The final prose can be concise while the review version retains references.

**Example:** Fact: completion fell from 62% to 58%. Interpretation: identity verification may be contributing. Recommendation: review verification-stage analytics before changing the flow.

**Action:** Separate three statements into fact, interpretation and recommendation.

**Saved component:** Synthesis rules and the fact/interpretation/recommendation structure.

**Quiz:**

1. How does synthesis differ from simple summarisation?  
     
   - ✅ It connects and selects information for a purpose  
   - — It is always shorter  
   - — It removes sources  
   - — It guarantees a recommendation  
   - *Explanation:* Synthesis combines sources around a decision or question.

   

2. Which statement is an interpretation?  
     
   - — Completion changed from 62% to 58%  
   - ✅ Users may be confused by verification  
   - — Review the funnel  
   - — The tracker was updated Tuesday  
   - *Explanation:* It explains a possible cause and needs supporting evidence.

   

3. Why retain source labels during review?  
     
   - ✅ To trace important claims  
   - — To improve the colour of the update  
   - — To remove human judgement  
   - — To guarantee positive tone  
   - *Explanation:* Reviewers can check how a conclusion was formed.

---

### Thursday (lesson): Templates create consistency without making every update identical

*Estimated time: 10 min*

**Hook:** A blank page asks the writer to remember the format, the audience and every risk—every single week.

**Theory:**

- A template defines the stable structure of an output while placeholders hold changing information. It reduces the effort of starting and makes omissions easier to notice.  
- For an executive product update, a useful template might include outcome, evidence, progress, risk, decision required and next milestone. For the team version, it might include owner and dependency.  
- Templates should not force content where none exists. If no decision is required, write 'No decision required' rather than inventing one.  
- Create separate templates for genuinely different audiences, but reuse a shared factual core. This reduces contradictory versions.

**Example:** Shared core: verified facts and risks. Executive output: three bullets. Team output: detailed actions and owners.

**Action:** Design a six-section executive update template with instructions for missing information.

**Saved component:** Executive and team output templates.

**Quiz:**

1. What is the main benefit of an output template?  
     
   - ✅ Consistent structure and fewer omissions  
   - — Guaranteed truth  
   - — No need for source data  
   - — The same wording every week  
   - *Explanation:* Templates support repeatability while content still changes.

   

2. What should happen if no decision is required?  
     
   - — Invent a decision  
   - ✅ State that no decision is required  
   - — Delete every section  
   - — Ask the model to guess  
   - *Explanation:* A template should expose absence rather than manufacture content.

   

3. How can multiple audience versions remain consistent?  
     
   - ✅ Use a shared factual core  
   - — Generate each from memory  
   - — Hide risks in one version  
   - — Use different source data  
   - *Explanation:* Audience adaptation should change detail, not the underlying facts.

---

### Friday (lesson): Critique before polish

*Estimated time: 10 min*

**Hook:** Once AI has polished the prose, missing evidence becomes harder to see.

**Theory:**

- Use a two-pass workflow. Pass one creates a factual review table with sources, conflicts and gaps. Pass two creates the audience-ready update only after the human checks pass one.  
- A critique prompt asks the model to identify weaknesses rather than rewrite immediately. Useful checks include unsupported claims, hidden risks, conflicting dates, vague ownership and invented certainty.  
- Do not use the model as the only evaluator of its own answer. Combine automated critique with source comparison and human judgement.  
- Define completion criteria: every metric matches the source, every risk remains visible, conflicts are resolved or flagged and the decision request is explicit.

**Example:** Pass one flags that 'on track' conflicts with an unresolved security dependency. Pass two says 'Target remains Friday, subject to security approval.'

**Action:** Create a five-question pre-publication checklist.

**Saved component:** The two-pass process and final quality checklist.

**Quiz:**

1. Why use a factual review pass before polished prose?  
     
   - ✅ To expose conflicts and missing evidence  
   - — To make the update longer  
   - — To remove source labels early  
   - — To avoid human review  
   - *Explanation:* Polish can make weak claims look more credible.

   

2. Should AI be the only evaluator of its own update?  
     
   - — Yes  
   - ✅ No  
   - — Only for executives  
   - — Only when the prose is short  
   - *Explanation:* Source checks and human judgement remain necessary.

   

3. Which is a strong completion criterion?  
     
   - — The tone sounds confident  
   - ✅ Every metric matches its source  
   - — The update uses five adjectives  
   - — Every risk is removed  
   - *Explanation:* Completion criteria should test accuracy and decision usefulness.

---

### Saturday (build): Build a two-pass stakeholder update workflow

*Estimated time: 35 min*

**Outcome:** Use ChatGPT or Claude to review mixed product inputs, flag conflicts and then produce an executive update and a delivery-team update from one factual core.

**Practice input:**

\[VERIFIED METRIC\] Onboarding completion: 62% last week, 58% this week.

\[DELIVERY STATUS\] New progress indicator built; QA starts Wednesday.

\[DELIVERY STATUS\] Security review for analytics events is not complete.

\[OLD ROADMAP\] Release target: Friday.

\[DECISION LOG\] No decision to delay release has been made.

\[UNCONFIRMED NOTE\] The verification vendor may be causing the conversion decline.

\[RISK\] If security approval is not received by Thursday noon, Friday release is unlikely.

\[ACTION\] Maya owns QA. Dev owns the security follow-up.

\[NEXT MILESTONE\] Go/no-go review Thursday 15:00.

**Prompt template given to learner:**

You will create a product update in two passes using only the labelled inputs I provide.

PASS 1 \- FACTUAL REVIEW

Return a table with: Claim, Type (Fact/Interpretation/Recommendation), Source label, Conflict or gap, Human check required.

Then list:

\- material changes since the previous period

\- risks and dependencies

\- decisions required

\- statements that must not appear as confirmed

Do not draft the stakeholder update yet. Ask me to confirm or correct the factual review.

PASS 2 \- ONLY AFTER I CONFIRM

Create:

A. Executive update: Outcome, Evidence, Progress, Risk, Decision required, Next milestone. Maximum 180 words.

B. Delivery-team update: Completed, In progress, Blockers, Owners, Dependencies, Next actions.

Rules:

\- Use one shared factual core.

\- Never invent status, cause, owner or date.

\- Preserve material risks in both versions.

\- If sources conflict, state the conflict.

\- Keep unconfirmed explanations labelled as unconfirmed.

\[PASTE LABELLED INPUTS\]

**Checks (definition of done):**

- [ ] Pass one happens before prose  
- [ ] Conflicts and gaps remain visible  
- [ ] Both versions use the same facts  
- [ ] Material risk appears in both versions  
- [ ] No unconfirmed cause is presented as fact

---

### Sunday (practice): Adapt it yourself: convert the workflow into a launch update

*Estimated time: 15 min*

**Challenge:** Adapt Saturday's workflow for a product launch update sent to commercial, support and operations leaders.

**Rules:**

- Add readiness areas such as product, operations, support and compliance  
- Keep one shared factual core  
- Create a red/amber/green status rule  
- Require evidence for every status  
- Add an explicit owner for every blocker

**Hints:**

- Try adapting this requirement: Add readiness areas such as product, operations, support and compliance  
- Try adapting this requirement: Keep one shared factual core  
- Try adapting this requirement: Create a red/amber/green status rule

**Reflection questions:**

- Did the audience change the facts or only the presentation?  
- Which conflict needed human resolution?  
- Was any RAG status unsupported?  
- What would make the workflow safe to reuse weekly?

---

## Module 5: AI Prototyping: Turn an Idea into Testable Behaviour {#module-5:-ai-prototyping:-turn-an-idea-into-testable-behaviour}

**Audience:** Applied module for both learner paths

**Outcome:** By Sunday, the learner can use ChatGPT or Claude to simulate an AI product behaviour, test it with realistic cases and distinguish a conversational prototype from a production product.

**Week at a glance:**

- Monday: User problem  
- Tuesday: Behaviour contract  
- Wednesday: Interaction flow  
- Thursday: Guardrails  
- Friday: Test plan

### Monday (lesson): Prototype the risky behaviour, not the entire product

*Estimated time: 10 min*

**Hook:** The fastest prototype is not the one with the fewest screens. It is the one that tests the biggest uncertainty.

**Theory:**

- An AI prototype is a quick representation of how an AI-powered experience might behave. Its purpose is to learn, not to prove that the finished product already exists.  
- Start with a user problem and risky assumption. For example: can an AI turn a rough feature idea into useful clarification questions without pretending the idea is already good?  
- Choose one narrow behaviour to simulate. Do not attempt authentication, databases, analytics and production automation when the key question is whether the AI interaction is useful.  
- State what the prototype will not test. A chat-based simulation can test instructions, questions and output usefulness; it cannot prove scalability, security, latency or integration feasibility.

**Example:** Problem: PMs jump from idea to solution. Prototype behaviour: ask five evidence-seeking questions before generating a feature brief.

**Action:** Write one user problem, one risky assumption and one behaviour to prototype.

**Saved component:** The prototype learning goal and scope boundary.

**Quiz:**

1. What should an early prototype focus on?  
     
   - — Every production feature  
   - ✅ The riskiest assumption or behaviour  
   - — A perfect visual design  
   - — A complete database  
   - *Explanation:* The prototype should maximise learning with minimal scope.

   

2. What can a chat-based prototype test well?  
     
   - ✅ Interaction instructions and output usefulness  
   - — Production scalability  
   - — Enterprise security certification  
   - — Database performance  
   - *Explanation:* A conversational simulation tests behaviour, not production infrastructure.

   

3. Why define what the prototype will not test?  
     
   - ✅ To avoid misleading conclusions  
   - — To make it look unfinished  
   - — To stop user feedback  
   - — To hide the learning goal  
   - *Explanation:* Clear boundaries prevent a useful simulation from being mistaken for a production-ready product.

---

### Tuesday (lesson): A behaviour contract tells the AI how to act

*Estimated time: 10 min*

**Hook:** A prototype becomes testable when expected behaviour is explicit enough to pass or fail.

**Theory:**

- A behaviour contract describes the AI's role, goal, allowed information, sequence, output and boundaries. It is more precise than a general request to 'be helpful'.  
- Define the interaction sequence. The prototype might first ask questions, then wait, then produce a brief. Without a stop-and-wait instruction, models often jump directly to an answer.  
- Specify what the AI should do when information is missing: ask, label an assumption or refuse to conclude. Missing information is part of the interaction design.  
- Use observable language. 'Ask no more than five questions, one at a time' is testable. 'Be thoughtful' is not.

**Example:** Before creating a brief, ask one question at a time about user, problem evidence, current alternative, success measure and constraints.

**Action:** Write five observable behaviours for the prototype.

**Saved component:** A behaviour contract with sequence and stop conditions.

**Quiz:**

1. What makes a behaviour testable?  
     
   - ✅ It is observable and specific  
   - — It sounds intelligent  
   - — It is very long  
   - — It contains a model name  
   - *Explanation:* A reviewer must be able to determine whether the behaviour occurred.

   

2. Why include a stop-and-wait instruction?  
     
   - ✅ To prevent the AI jumping ahead  
   - — To make the response slower  
   - — To remove interaction  
   - — To guarantee accuracy  
   - *Explanation:* The prototype should follow the intended conversation sequence.

   

3. What should happen when key information is missing?  
     
   - — The AI invents it  
   - ✅ The contract defines whether to ask or label an assumption  
   - — The prototype silently ends  
   - — The output becomes longer  
   - *Explanation:* Missing information needs explicit behaviour.

---

### Wednesday (lesson): Design the interaction as states

*Estimated time: 10 min*

**Hook:** A good AI conversation is not one endless prompt. It moves through recognisable stages.

**Theory:**

- A state is a stage of the interaction with a purpose and an allowed next step. A simple prototype may have Discovery, Clarification, Draft and Review states.  
- State design helps prevent premature answers. The prototype should not enter Draft until the minimum information is collected or the missing assumptions are explicitly accepted.  
- Define transitions using simple conditions: after five questions, produce a summary; if the user corrects a fact, update the summary; if sensitive data appears, warn and ask for a redacted version.  
- The user should know what is happening. Short messages such as 'I have enough information to draft the brief' create clarity and control.

**Example:** Discovery \-\> five questions \-\> Confirm understanding \-\> Draft brief \-\> User critique \-\> Revised brief.

**Action:** Create four states and one transition rule between each state.

**Saved component:** The prototype state flow.

**Quiz:**

1. What is a state in an AI interaction?  
     
   - ✅ A stage with a purpose and allowed next step  
   - — A model's physical location  
   - — A random response  
   - — A visual colour  
   - *Explanation:* States make conversational behaviour easier to design and test.

   

2. When should the prototype move into Draft?  
     
   - — Immediately  
   - ✅ When minimum information is present or assumptions are explicit  
   - — After one compliment  
   - — Whenever the user says AI  
   - *Explanation:* The transition should depend on defined readiness.

   

3. Why tell the user when the state changes?  
     
   - ✅ To create clarity and control  
   - — To expose hidden reasoning  
   - — To make every response longer  
   - — To avoid questions  
   - *Explanation:* The interface should communicate progress without revealing private chain-of-thought.

---

### Thursday (lesson): Guardrails define what the prototype must not do

*Estimated time: 10 min*

**Hook:** The most important prototype instruction may be the action it refuses to take.

**Theory:**

- Guardrails are rules or controls that constrain unsafe, misleading or unwanted behaviour. They may concern privacy, unsupported claims, harmful content, sensitive decisions or product scope.  
- Prompt instructions are one layer, not a complete safety system. A production product may also need access controls, data handling rules, moderation, monitoring, audit logs and human approval.  
- Design a graceful fallback. Instead of inventing evidence, the prototype can say what is missing and ask a focused question. Instead of handling personal data, it can ask for anonymised input.  
- Avoid presenting the prototype as an authority. It can help structure a feature idea, but it should not approve a roadmap, make legal conclusions or claim customer demand without evidence.

**Example:** If the user provides no evidence, respond: 'I can draft this as a hypothesis, but I cannot describe it as a validated customer problem.'

**Action:** Write three prohibited behaviours and a safe fallback for each.

**Saved component:** The prototype guardrails and fallback messages.

**Quiz:**

1. What is a guardrail?  
     
   - ✅ A rule or control limiting unwanted behaviour  
   - — A visual border  
   - — A success metric only  
   - — A longer output  
   - *Explanation:* Guardrails constrain how the AI should behave in risky or uncertain situations.

   

2. Are prompt instructions a complete production safety system?  
     
   - — Yes  
   - ✅ No  
   - — Only for prototypes  
   - — Only when written in capitals  
   - *Explanation:* Production safety may require technical, operational and governance controls beyond prompts.

   

3. What is a graceful fallback?  
     
   - — Invent missing evidence  
   - ✅ Explain what is missing and ask for a safe next input  
   - — End without explanation  
   - — Approve the idea anyway  
   - *Explanation:* A fallback preserves usefulness without pretending certainty.

---

### Friday (lesson): Test conversations reveal more than one perfect demo

*Estimated time: 10 min*

**Hook:** Your prototype is not the happy path. It is how the behaviour changes when the input becomes messy.

**Theory:**

- A conversation test is a planned interaction used to check the behaviour contract. Create a normal case, a missing-information case, a contradictory case, a sensitive-data case and an out-of-scope case.  
- Write expected behaviour before running the test. Otherwise, it is easy to accept whatever the model produces and call it successful.  
- Capture failures as specific observations: asked two questions at once, invented evidence, skipped confirmation or ignored a constraint. Then change one instruction and rerun the same test.  
- A prototype is successful when it answers the learning question, even if the result shows the idea is not useful. Learning is the outcome; polish is secondary.

**Example:** Test: user says 'Everyone wants this feature' but provides no evidence. Expected: label it as an assumption and ask for the source.

**Action:** Write five test conversations and expected behaviours.

**Saved component:** The Friday test plan and success criteria.

**Quiz:**

1. When should expected behaviour be written?  
     
   - ✅ Before running the test  
   - — After seeing the output  
   - — Only after launch  
   - — Never  
   - *Explanation:* Predefined expectations reduce the temptation to accept any result.

   

2. Which is a specific failure observation?  
     
   - — It was bad  
   - ✅ It asked two questions at once despite the rule  
   - — I did not like it  
   - — The model is strange  
   - *Explanation:* Specific observations can guide a targeted change and retest.

   

3. Can a prototype succeed by showing that an idea is not useful?  
     
   - ✅ Yes, if it answers the learning question  
   - — No  
   - — Only with a polished interface  
   - — Only after automation  
   - *Explanation:* The goal of prototyping is learning, including evidence against the idea.

---

### Saturday (build): Build a conversational Feature Brief Copilot prototype

*Estimated time: 40 min*

**Outcome:** Use ChatGPT or Claude to simulate an AI feature that questions a rough product idea before creating an evidence-aware feature brief. This tests conversational behaviour; it is not a coded or production-ready product.

**Practice input:**

Initial idea to test: 'We should add an AI chatbot to the onboarding screen because competitors have one.'

**Prompt template given to learner:**

You are simulating a Feature Brief Copilot for product managers. Your purpose is to improve the definition of an early product idea before drafting a brief.

BEHAVIOUR

1\. Ask for the rough idea.

2\. Ask no more than five clarification questions, one at a time, covering: target user, problem evidence, current alternative, desired outcome and constraints. Wait after every question.

3\. Separate facts supplied by the user from assumptions. Never invent research, metrics or customer demand.

4\. After the questions, summarise your understanding under Facts, Assumptions and Missing information. Ask the user to confirm or correct it. Do not draft until confirmed.

5\. After confirmation, create a feature brief with: User, Problem, Evidence, Hypothesis, Proposed behaviour, Non-goals, Success measures, Risks, Open questions and Smallest test.

6\. End with the three assumptions that should be tested first.

GUARDRAILS

\- Do not describe an unvalidated idea as a validated problem.

\- If personal or confidential data is offered, ask for an anonymised version.

\- Do not make legal, compliance or security approval decisions.

\- If evidence is missing, label it clearly and ask for the next useful evidence.

\- Stay within product discovery; do not claim that this prototype proves technical feasibility.

Acknowledge these rules in one sentence, then ask for the rough product idea.

**Checks (definition of done):**

- [ ] The prototype asks one question at a time  
- [ ] Facts and assumptions are separated  
- [ ] It waits for confirmation before drafting  
- [ ] Privacy and authority boundaries are respected  
- [ ] The learner reruns a failed test after one change

---

### Sunday (practice): Adapt it yourself: create a different AI behaviour prototype

*Estimated time: 15 min*

**Challenge:** Choose one behaviour to prototype: PRD critic, research-plan coach or experiment-design assistant. Adapt the behaviour contract rather than starting from a blank prompt.

**Rules:**

- Write one learning question  
- Define at least three states  
- Add three prohibited behaviours  
- Create five test conversations before running them  
- State what the chat prototype cannot prove

**Hints:**

- Try adapting this requirement: Write one learning question  
- Try adapting this requirement: Define at least three states  
- Try adapting this requirement: Add three prohibited behaviours

**Reflection questions:**

- What was the riskiest assumption?  
- Which test exposed the biggest failure?  
- What instruction changed the behaviour most?  
- What would require code, data integration or organisational approval before production?

---

