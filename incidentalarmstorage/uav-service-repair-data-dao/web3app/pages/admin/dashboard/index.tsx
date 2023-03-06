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

import { DashboardStat, BurnSBT } from "~~/components/Dashboard";
import ConnectedLayout from "~~/components/layouts/ConnectedLayout";
import HasTokenLayout from "~~/components/layouts/HasTokenLayout";
import NavBar from "~~/components/NavBar";
import PageTransition from "~~/components/PageTransition";
import { NextPageWithLayout } from "~~/pages/_app";

const AdminDashboard: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>DALN - Dashboard</title>
      </Head>
      <PageTransition>
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
              <Heading
                as="h1"
                size="md"
                fontWeight={500}
                textAlign="center"
                mb={2}
              >
                Manage DALN data
              </Heading>
            </CardHeader>

            <CardBody>TODO: Table</CardBody>
          </Card>
        </Container>
      </PageTransition>
    </>
  );
};

AdminDashboard.getLayout = function getLayout(page) {
  return (
    <ConnectedLayout>
      <HasTokenLayout>{page}</HasTokenLayout>
    </ConnectedLayout>
  );
};

export default AdminDashboard;
