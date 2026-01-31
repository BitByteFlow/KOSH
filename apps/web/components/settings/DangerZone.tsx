import { useState } from "react";
import { SettingsSection } from "./SettingSeciton";
import { AlertCircle } from "lucide-react";

export function DangerZone() {
	const [showConfirm, setShowConfirm] = useState(false);

	const handleDeleteClick = () => {
		setShowConfirm(true);
	};

	const handleConfirmDelete = () => {
		console.log("[v0] Delete account confirmed");
		setShowConfirm(false);
	};

	return (
		<SettingsSection title="Danger Zone">
			<div className="p-4 bg-destructive/5 border border-destructive/30 rounded-lg">
				<div className="flex items-start gap-3">
					<AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
					<div className="flex-1">
						<h3 className="font-medium text-destructive">
							Delete Organization
						</h3>
						<p className="text-sm text-muted-foreground mt-1">
							This action cannot be undone. All data will be permanently
							removed.
						</p>
						<div className="mt-4">
							{!showConfirm ? (
								<button
									onClick={handleDeleteClick}
									className="px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors"
								>
									Delete Account
								</button>
							) : (
								<div className="space-y-3">
									<p className="text-sm font-medium text-foreground">
										Are you sure? This cannot be undone.
									</p>
									<div className="flex gap-3">
										<button
											onClick={handleConfirmDelete}
											className="px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors"
										>
											Yes, Delete Account
										</button>
										<button
											onClick={() => setShowConfirm(false)}
											className="px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-md hover:bg-muted/80 transition-colors"
										>
											Cancel
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</SettingsSection>
	);
}
