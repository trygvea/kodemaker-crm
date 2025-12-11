import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default {
  fallback: (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  withImage: (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  sizes: (
    <div className="flex items-center gap-4">
      <Avatar className="size-8">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="size-16">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};
