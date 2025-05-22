import { Client, Databases } from "appwrite";

const client = new Client();
const databases = new Databases(client);

client
    .setEndpoint('https://appwrite.tunazorlu.com.tr/v1')
    .setProject('681514b700261e81beb9');

export { client, databases };