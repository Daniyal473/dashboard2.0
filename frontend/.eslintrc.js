module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'prettier/prettier': 'off', // Disable prettier rules for now
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off'
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        'prettier/prettier': 'off'
      }
    }
  ]
};
