export type MessageType =
  | "create"
  | "update"
  | "delete"
  | "get"
  | "signIn"
  | "signUp"
  | "signOut"
  | "notFound"
  | "alreadyExists"
  | "unauthorized"
  | "forbidden"
  | "badRequest"
  | "expired"
  | "inactive"
  | "blocked"
  | "validation";

const message = (
  type: MessageType,
  entity: string,
  note = "" as string
): string => {
  const entityCapitalized =
    entity.charAt(0).toUpperCase() + entity.slice(1).toLowerCase();

  const messages: Record<MessageType, string> = {
    create: `${entityCapitalized} was successfully created and is now available.`,
    update: `${entityCapitalized} was successfully updated with the latest information.`,
    delete: `${entityCapitalized} was successfully deleted and is no longer available.`,
    get: `${entityCapitalized} details were successfully retrieved from the system.`,
    signIn: `${entityCapitalized} was successfully signed in. Welcome back!`,
    signUp: `${entityCapitalized} was successfully registered. Welcome aboard!`,
    signOut: `${entityCapitalized} was successfully signed out of the system.`,
    notFound: `${entityCapitalized} was not found. It may not exist or has been removed.`,
    alreadyExists: `${entityCapitalized} already exists. Please use a different one or log in.`,
    unauthorized: `${entityCapitalized} access denied. You do not have the required permissions to perform this action.`,
    forbidden: `${entityCapitalized} access is forbidden. You are not allowed to view or modify this resource.`,
    badRequest: `${entityCapitalized} request is invalid. Please check your input and try again.`,
    expired: `${entityCapitalized} has expired. Please request a new one or try again later.`,
    blocked: `${entityCapitalized} has blocked. Please request a new one or try again later.`,
    inactive: `${entityCapitalized} has deactivated. Please request a new one or try again later.`,
    validation: `${entityCapitalized} validation failed. Please check the provided information.`, // ✅ New message
  };

  return `${messages[type]} ${note}`.trim();
};

export default message;
