import { SyncDataLoaderFeatureDef } from "../features/sync-data-loader/types";

export type DataAdapterConfig<T> = {
  rootItemId: SyncDataLoaderFeatureDef<T>["config"]["rootItemId"];
  dataLoader: SyncDataLoaderFeatureDef<T>["config"]["dataLoader"];
};
