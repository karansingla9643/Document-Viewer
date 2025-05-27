import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CustomAlertProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ open, onClose, onConfirm, title, description }) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={onConfirm} variant="destructive">Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};