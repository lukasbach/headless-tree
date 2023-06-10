import React from "react";
import { Title, Container, Box, Text } from "@mantine/core";
import { LayoutContainer } from "@/components/layout/layout-container";
import { DemoBox } from "@/components/page/demo-box";

export default function Home() {
  return (
    <LayoutContainer location="/">
      <Box my={20} mx={40}>
        <Title order={1}>Headless Tree</Title>
        <Text fz="lg" mb="20px">
          An unopinionated and accessible Tree component for the web.
        </Text>
      </Box>

      <DemoBox
        initialStory={"React/General/Simple Example"}
        height="600px"
        fullWidth={true}
      />
      <Container mt={80}>
        <Title order={2}>Features</Title>
        Blablabla
      </Container>
    </LayoutContainer>
  );
}
