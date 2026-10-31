import { useParams } from "react-router"
import { LibraryWorkspaceView } from "@/components/features/materials/workspace/library-workspace-view"

export default function StudentLibraryWorkspacePage() {
  const { resourceId = "" } = useParams()
  return <LibraryWorkspaceView key={resourceId} resourceId={resourceId} />
}
