"use server";

import {
  BUCKET_ID,
  DATABASE_ID,
  databases,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  storage,
  users,
} from "../appwrite.config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file";

export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone, 
      undefined,
      user.name
    );
    console.log("Newly Created User: ", newUser);
    // return parseStringify(newUser)
    return newUser;
  } catch (error: any) {
    console.log("Error Creating User:", error);

    // if (error && error?.code === 409) {
    //   const documents = await users.list([Query.equal("email", [user.email])]);
    //   return documents?.users[0];
    // }

    if (error?.code === 409) {
      try {
        const documents = await users.list([
          Query.equal("email", [user.email]),
        ]);
        console.log("Existing user documents: ", documents);
        if (documents?.users?.length > 0) {
          const existingUser = documents.users[0];
          console.log("Returning existing user: ", existingUser);
          return existingUser;
        }
      } catch (fetchError:any) {
        console.log("Error fetching existing users: ", fetchError);
      }
    }

    throw error;
  }
};

export const getUser = async (userId: string) => {
  // try{
  //     const user=await users.get(userId)
  //     console.log("From getUser",user)
  //     return parseStringify(user)

  // }catch(error){
  //     console.log(error)
  // }

  try {
    if (!userId) throw new Error("User ID is Required");

    const user = await users.get(userId);
    // console.log("From getUser: ", user);
    return parseStringify(user);
  } catch (error:any) {
    // console.log("Error in getUser: ", error);
    throw new Error("Failed to fetch user data",error);
  }
};

export const getPatient = async (userId: string) => {
  try {
    const patient = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );
    return parseStringify(patient.documents[0]);
  } catch (error:any) {
    console.log(error);
  }
};

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    let file;
    if (identificationDocument) {
      const inputFile = InputFile.fromBuffer(
        identificationDocument?.get("blobFile") as Blob,
        identificationDocument?.get("fileName") as string
      );
      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    console.log({
      identificationDocumentId: file?.$id || null,
      identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
      ...patient,
    });

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        ...patient,
      }
    );
    return parseStringify(newPatient)
  } catch (error:any) {
    console.log(error);
  }
};
