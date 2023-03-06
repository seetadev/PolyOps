import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import Head from "next/head";

import { NextPageWithLayout } from "../_app";

import { DashboardStat, BurnSBT } from "~~/components/Dashboard";
import ConnectedLayout from "~~/components/layouts/ConnectedLayout";
import HasTokenLayout from "~~/components/layouts/HasTokenLayout";
import PageTransition from "~~/components/PageTransition";

const Dashboard: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>DALN - Dashboard</title>
      </Head>
      <Container
        maxW="container.xl"
        mt={{
          base: 4,
          md: 16,
          lg: 24,
        }}
      >
        <Card w="full">
          <CardHeader>
            <Flex justifyContent="flex-end" alignItems="center">
              <BurnSBT />
            </Flex>

            <Heading
              as="h1"
              size="md"
              fontWeight={500}
              textAlign="center"
              mb={2}
            >
              Manage DALN membership token
            </Heading>
          </CardHeader>

          <CardBody>
            <SimpleGrid columns={[1, 2]} spacing={5}>
              {/* TODO: Fetch info from user */}
              <DashboardStat label="Rewards" helpText="Matic" number="1.27" />
              <DashboardStat label="Decryption Sessions" number="5" />
              <DashboardStat label="Token ID" number="bd847700" />
              <DashboardStat label="SBT Contract" number="0x7580...B462C1" />
            </SimpleGrid>
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

Dashboard.getLayout = function getLayout(page) {
  return (
    <ConnectedLayout>
      <HasTokenLayout>{page}</HasTokenLayout>
    </ConnectedLayout>
  );
};

export default Dashboard;
