import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface NoPermissionFallbackProps {
    title?: string;
    description?: string;
}

export function NoPermissionFallback({
    title = "Access Denied",
    description = "You don't have permission to access this resource."
}: NoPermissionFallbackProps) {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="text-center max-w-md p-6">
                <div className="bg-red-100 mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6">
                    <ShieldX className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
                <p className="text-muted-foreground mb-6">{description}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        </div>
    );
}