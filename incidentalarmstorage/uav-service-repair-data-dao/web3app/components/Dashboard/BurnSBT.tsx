import {
  useDisclosure,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { Component, useRef } from "react";

interface BurnSBTProps extends Partial<Component<typeof Button>> {
  alertDialogProps?: Component<typeof AlertDialog>;
}

export default function BurnSBT({ alertDialogProps, ...props }: BurnSBTProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  return (
    <>
      <Button colorScheme="red" variant="outline" onClick={onOpen} {...props}>
        Burn my SBT
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        {...alertDialogProps}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Are you sure?
            </AlertDialogHeader>

            <AlertDialogBody>
              If you burn your soul-bound token, you will lose your DAO
              membership and stop sharing your data. You will also stop
              receiving rewards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              {/* TODO: Burn token */}
              <Button colorScheme="red" onClick={onClose} ml={3}>
                Burn it anyway
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
