"use client";

import { useState } from "react";
import { SettingsSection } from "./SettingSection";
import { useStore } from "@/context/StoreContext";
import { Button } from "@kosh/ui/components/button";
import { Input } from "@kosh/ui/components/input";
import { Label } from "@kosh/ui/components/label";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@kosh/ui/components/badge";

export function StoreConfiguration() {
	const { currentStore, activeStoreId } = useStore();
	const [showFullId, setShowFullId] = useState(false);
	const [copied, setCopied] = useState(false);

	const storeId = currentStore?.id || activeStoreId || "";

	const formatStoreId = (id: string) => {
		if (!showFullId && id.length > 8) {
			return `${id.slice(0, 4)}...${id.slice(-4)}`;
		}
		return id;
	};

	const handleCopy = async () => {
		if (!storeId) return;

		try {
			await navigator.clipboard.writeText(storeId);
			setCopied(true);
			toast.success("Store ID copied to clipboard");

			setTimeout(() => {
				setCopied(false);
			}, 2000);
		} catch (error) {
			toast.error("Failed to copy Store ID");
		}
	};

	return (
		<SettingsSection
			title="Store Configuration"
			description="Manage your store connection and view store details."
		>
			<div className="space-y-6 p-4 bg-background rounded-lg border border-border">
				<div className="space-y-2">
					<Label
						htmlFor="storeId"
						className="text-sm font-semibold text-foreground flex items-center gap-2"
					>
						Store ID
						<Badge
							variant="outline"
							className="text-xs font-normal bg-blue-50 text-blue-700 border-blue-200"
						>
							Required for POS Join
						</Badge>
					</Label>
					<div className="flex gap-2">
						<Input
							id="storeId"
							value={formatStoreId(storeId)}
							readOnly
							className="flex-1 h-12 bg-muted/50 font-mono text-sm"
						/>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() => setShowFullId(!showFullId)}
								className="h-12 w-12 shrink-0"
								title={showFullId ? "Hide Store ID" : "Show Store ID"}
							>
								{showFullId ? (
									<EyeOff size={18} className="text-muted-foreground" />
								) : (
									<Eye size={18} className="text-muted-foreground" />
								)}
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={handleCopy}
								disabled={!storeId}
								className="h-12 w-12 shrink-0"
								title="Copy Store ID"
							>
								{copied ? (
									<Check size={18} className="text-green-600" />
								) : (
									<Copy size={18} className="text-muted-foreground" />
								)}
							</Button>
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						This Store ID is required when joining a new POS device or cashier
						to this store. Share this ID with the cashier to allow them to
						connect.
					</p>
				</div>

				{currentStore?.name && (
					<div className="space-y-2">
						<Label className="text-sm font-semibold text-foreground">
							Store Name
						</Label>
						<div className="h-12 px-3 py-2 border border-border rounded-md text-sm bg-muted/50 flex items-center">
							{currentStore.name}
						</div>
					</div>
				)}
			</div>
		</SettingsSection>
	);
}
