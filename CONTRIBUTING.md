# Contributing

To run locally, you need to install NodeJS and Yarn. Locally installing
Volta is recommended, since it will make sure to use the correct versions
of NodeJS and Yarn.

To develop locally, run ``yarn`` to install dependencies, then

- ``yarn start`` to build the library in watch mode and start the storybook instance
- ``yarn start:docs`` to work on the documentation page. You might need to run
  ``yarn build`` first. If you just want to edit documentation pages, you can also
  just directly edit the markdown files.
- ``yarn verify`` to run the linter, tests and build the library

When proposing a new change, please document the changes and whether
they are breaking or not by running ``yarn changeset`` prior to committing.

Before proposing your changes, please check if you those of the following steps
which make sense in the scope of your change have been completed:

- Changes to the usage of the library are documented in the Docs Pages
- Potential visual features are reproducible in a Storybook story
- Unit Tests verifying the changes have been implemented
- Linter and Unit Tests run successfully

Feel free to reach out at any time during your contribution process if you 
have any questions or need help. You can also collaborate in our Discord
community to get help or discuss your ideas with other contributors:
- https://discord.gg/WN85eMY3

There are some more detailed documentations available on contributing implementation
changes to Headless Tree at the HT website: 
- https://headless-tree.lukasbach.com/contributing/overview