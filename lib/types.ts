export interface IUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  image: string;
  profile?: IUserProfile;
}
export interface IMessageSearchResults {
  id: string;
  name: string;
  email: string;
  image: string;
  alias: string; // Alias can be a string or null if it doesn't exist
}

export interface IPoll {
  id: string;
  postId: number;
  question: string;
  options: string[];
}

// PostActionType enum based on your model
export enum IPostActionType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  SHARE = 'SHARE',
}

// Type for the PostAction model
export interface IPostAction {
  id: string;
  userProfileId: string;
  postId: number;
  actionType: PostActionType; // PostActionType enum
  createdAt: Date; // DateTime
  userProfile: IUserProfile; // Assuming UserProfile is a type that is already defined
  post: IPost; // Assuming Post is a type that is already defined
}

export interface IPost {
  id: number;
  brief: string;
  extendedDescription: string;
  likes: number;
  authorId: string;
  author: IUserProfile;
  comments: IComment[];
  media: IMedia[];
  poll?: IPoll;
  actions: IPostAction;
}

export interface IAlias {
  id: string; // UUID for the Alias
  name: string; // Unique alias name
  userId: string; // Foreign key to the associated UserProfile
  userProfile?: IUserProfile; // The associated UserProfile for this Alias
}

export interface IUserProfile {
  id: string;
  userId: string;
  email: string;
  alias: IAlias;
  user: IUser;
  image: string;
  name: string;
  title: string;
  university: string;
  bio: string;
  location: string;
  github: string;
  codeforces: string;
  posts: IPost[];
  education: IDegree[];
  experiences: IExperience[];
  skills: string[];
  projects: IProjectProfile[];
  contributedProjects: IProjectProfile[];
  ledProjects: IProjectProfile[];
  comments: IComment[];
  replies: IReply[];
}

export interface IComment {
  id: number;
  text: string;
  likes: number;
  authorId: string;
  author: IUserProfile;
  postId: number;
  post: IPost;
  replies: IReply[];
}

export interface IReply {
  id: number;
  text: string;
  likes: number;
  authorId: string;
  author: IUserProfile;
  commentId: number;
  comment: IComment;
}

export interface IDegree {
  id: string;
  userProfileId: string;
  userProfile: IUserProfile;
  degreeName: string;
  institution: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

export interface IExperience {
  id: string;
  userProfileId: string;
  userProfile: IUserProfile;
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

export interface IProjectProfile {
  id: string;
  image?: string;
  name: string;
  projectLeadId: string;
  projectLead: IUserProfile;
  brief: string;
  description: string;
  github?: string;
  liveLink?: string;
  techStack: string[];
  startDate: Date;
  endDate?: Date;
  status: string;
  tags: string[];
  media: IMedia[];
  ownerId: string;
  owner: IUserProfile;
  contributors: IUserProfile[];
}

export interface IMedia {
  id: string;
  url: string;
  type: MediaType;
  altText?: string;
  order?: number;
  postId?: number;
  post?: IPost;
  projectId?: string;
  project?: IProjectProfile;
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  GIF = 'GIF',
}

export enum ConversationType {
  ONE_ON_ONE = 'ONE_ON_ONE',
  GROUP = 'GROUP',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  POST_SHARE = 'POST_SHARE',
}

export enum PostActionType {
  LIKED = 'LIKED',
  SAVED = 'SAVED',
  COMMENTED = 'COMMENTED',
  SHARED = 'SHARED',
  REPOSTED = 'REPOSTED',
}

export interface IConversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  type: ConversationType;
  participants: IConversationParticipant[];
  messages: IMessage[];
}

export interface IConversationParticipant {
  id: string;
  conversationId: string;
  // Optional if you populate conversation details alongside the participant.
  conversation?: IConversation;
  userId: string;
  userProfile: IUserProfile;
  lastReadAt?: Date;
}

export interface IMessage {
  id: string;
  conversationId: string;
  // Optional if you populate conversation details alongside the message.
  conversation?: IConversation;
  senderId: string;
  sender: IUserProfile;
  type: MessageType;
  content?: string;
  // If the message shares a post.
  postId?: number;
  post?: IPost;
  mediaUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostAction {
  id: string;
  userProfileId: string;
  userProfile: IUserProfile;
  postId: number;
  post: IPost;
  actionType: PostActionType;
  createdAt: Date;
}
