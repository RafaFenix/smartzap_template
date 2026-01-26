
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, PlusCircle, Smartphone, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInstance } from '@/components/providers/InstanceProvider';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useRouter } from 'next/navigation';

export function InstanceSwitcher({ className }: { className?: string }) {
    const { currentInstance, instances, switchInstance } = useInstance();
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    const handleCreateNew = () => {
        setOpen(false);
        router.push('/settings/connect'); // Assuming this is the route to add new instance
    };

    if (!currentInstance) {
        return (
            <Button variant="outline" className="w-[200px] justify-between" onClick={handleCreateNew}>
                <span className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" /> Connect Number
                </span>
            </Button>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-[200px] justify-between", className)}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Smartphone className="h-4 w-4 shrink-0 opacity-50" />
                        <span className="truncate">{currentInstance.name}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search account..." />
                    <CommandList>
                        <CommandEmpty>No account found.</CommandEmpty>
                        <CommandGroup heading="Accounts">
                            {instances.map((instance) => (
                                <CommandItem
                                    key={instance.id}
                                    onSelect={() => {
                                        switchInstance(instance.id);
                                        setOpen(false);
                                    }}
                                    className="text-sm"
                                >
                                    <Smartphone className="mr-2 h-4 w-4 opacity-50" />
                                    {instance.name}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            currentInstance.id === instance.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                    <CommandSeparator />
                    <CommandList>
                        <CommandGroup>
                            <CommandItem onSelect={() => {
                                setOpen(false);
                                router.push('/settings/instances');
                            }}>
                                <Settings className="mr-2 h-5 w-5" />
                                Gerenciar Números
                            </CommandItem>
                            <CommandItem onSelect={handleCreateNew}>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Add New Number
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
