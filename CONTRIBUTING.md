# Contributing

To run locally, you need to install NodeJS and Yarn. Locally installing
Volta is recommended, since it will make sure to use the correct versions
of NodeJS and Yarn.

To develop locally, run ``yarn`` to install dependencies, then

- ``yarn start`` to build the library in watch mode and start the storybook instance
- ``yarn start:docs`` to work on the documentation page. You might need to run
  ``yarn build`` first. If you just want to edit documentation pages, you can also
  just directly edit the markdown files.

When proposing a new change, please document the changes and whether
they are breaking or not by running ``yarn changeset`` prior to committing.

TODO: The following steps need to be improved for a good contributing community:
- Documentation on library architecture
- Test Automation
