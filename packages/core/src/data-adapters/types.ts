import { DragAndDropFeatureDef } from "../features/drag-and-drop/types";
import { SyncDataLoaderFeatureDef } from "../features/sync-data-loader/types";

export type DataAdapterConfig<T> = {
  rootItemId: SyncDataLoaderFeatureDef<T>["config"]["rootItemId"];
  dataLoader: SyncDataLoaderFeatureDef<T>["config"]["dataLoader"];
  onDrop: DragAndDropFeatureDef<T>["config"]["onDrop"];
  // TODO onDropForeignDragObject: DragAndDropFeatureDef<T>["config"]["onDropForeignDragObject"];
};
