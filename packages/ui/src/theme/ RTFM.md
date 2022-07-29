<FormControl variant="floating" id="first-name" isRequired isInvalid>
  <Input placeholder=" " />
  {/* It is important that the Label comes after the Control due to css selectors */}
  <FormLabel>First name</FormLabel>
  <FormHelperText>Keep it very short and sweet!</FormHelperText>
  <FormErrorMessage>Your First name is invalid</FormErrorMessage>
</FormControl>
