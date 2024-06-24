import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

export default function AlertModal({
  title,
  description,
  isOpen,
  onOpenChange,
}: {
  title: string;
  description: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  return (
    <Modal className="dark" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-danger-500">
              {title}
            </ModalHeader>
            <ModalBody className="text-zinc-200">
              <p>{description}</p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="flat" onPress={onClose}>
                Okay
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
