import { useParams } from "wouter";
import EntityDetail from "./EntityDetail";
import EntityProfileDB from "./EntityProfileDB";

/**
 * Smart router that directs to the appropriate entity page:
 * - Numeric IDs (1, 12, 60011) -> EntityProfileDB (database-backed)
 * - String IDs (hsa-group, cby-aden) -> EntityDetail (static data)
 */
export default function EntityRouter() {
  const params = useParams();
  const entityId = params.id as string;
  
  // Check if the ID is numeric
  const isNumericId = /^\d+$/.test(entityId);
  
  if (isNumericId) {
    return <EntityProfileDB />;
  }
  
  return <EntityDetail />;
}
