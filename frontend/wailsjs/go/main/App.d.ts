// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {main} from '../models';

export function AddCluster(arg1:string):Promise<string>;

export function GetNamespacesFromCluster(arg1:string):Promise<Array<string>>;

export function GetResourcesFromNamespace(arg1:string,arg2:string):Promise<main.NamespaceResources>;

export function GetWorkloadsFromNamespace(arg1:string,arg2:string):Promise<Record<string, Array<string>>>;

export function ListClusters():Promise<Array<string>>;
