import {
  Card,
  CardBody,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";

interface DashboardItemProps {
  label: string;
  helpText?: string;
  number: string;
}

export default function DashboardItem({
  label,
  helpText,
  number,
}: DashboardItemProps) {
  return (
    <Card
      display="flex"
      justifyContent="center"
      alignItems="center"
      variant="outline"
    >
      <CardBody textAlign="center">
        <Stat>
          <StatLabel>{label}</StatLabel>
          <StatNumber display="inline-block">{number}</StatNumber>
          {helpText && (
            <StatHelpText display="inline-block" ml={1}>
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </CardBody>
    </Card>
  );
}
