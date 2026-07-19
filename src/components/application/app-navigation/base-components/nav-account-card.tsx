"use client";
import { cx } from "@/utils/cx";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";

export const NavAccountCard = ({ avatarRounded }: { avatarRounded?: boolean }) => {
    return (
        <div className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-inset ring-border">
            <AvatarLabelGroup
                size="md"
                title="Super Admin"
                subtitle="admin@onelgu.gov.ph"
                status="online"
                rounded={avatarRounded}
            />
        </div>
    );
};
