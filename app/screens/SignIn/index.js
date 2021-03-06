import React, { useRef, useMemo, useCallback } from 'react'
import { useMutation } from '@apollo/client'
import { useDispatch } from 'react-redux'

import get from 'lodash/get'

import i18n from 'i18n'
import Utils from 'utils'
import ValidationService from 'services/validation'

import AppConfig from 'config/app'
import * as Routes from 'navigation/routes'
import { ReactNavigationPropTypes } from 'constants/propTypes'

import SIGN_IN_BY_PHONE from 'graphql/mutations/signInByPhone.graphql'

import { signInSuccess } from 'store/slices/session'

import {
  Container,
  Scrollable,
  Top,
  LogoContainer,
  Logo,
  TabBar,
  Middle,
  Title,
  Description,
  Instruction,
  InstructionHighlight,
  Inner,
  Content,
  Bottom,
  Footer,
  Button,
  Form,
  FormField,
  FormTextInput,
  ForgotPassword,
  TAB_HASH,
} from './styles'

const SignInScreen = ({ navigation }) => {
  const passwordRef = useRef()

  const dispatch = useDispatch()
  const [signInByPhone] = useMutation(SIGN_IN_BY_PHONE)

  const initialValues = useMemo(() => {
    return {
      phone: AppConfig.credentials.phone,
      password: AppConfig.credentials.password,
      withRefresh: true,
    }
  }, [])

  const validate = (values) => {
    const constraints = {
      phone: {
        presence: {
          allowEmpty: false,
        },
      },
      password: {
        presence: {
          allowEmpty: false,
        },
        length: { minimum: 6, maximum: 100 },
      },
    }

    return ValidationService.validate(constraints, values, {
      alias: {
        phone: i18n.t('screen.signIn.form.label.phone'),
        password: i18n.t('screen.signIn.form.label.password'),
      },
    })
  }

  const onSubmit = useCallback(
    async (values) => {
      try {
        const signInMutation = await signInByPhone({ variables: values })
        const signInResponse = get(signInMutation, 'data.signInByEmail')

        dispatch(
          signInSuccess({
            token: signInResponse.accessToken,
            refreshToken: signInResponse.refreshToken,
          }),
        )
      } catch (error) {} // eslint-disable-line no-empty
    },
    [signInByPhone, dispatch],
  )

  const instruction = Utils.Strings.replaceWithComponent(
    i18n.t('screen.signIn.phrase.useBfast'),
    (match, i) => {
      return <InstructionHighlight key={match + i}>{match}</InstructionHighlight>
    },
  )

  const handleTabChange = useCallback(
    (nextTab) => {
      if (nextTab === TAB_HASH.SIGN_UP) {
        navigation.navigate(Routes.SignUp)
      }
    },
    [navigation],
  )

  const handleForgotPassword = useCallback(
    (values) => {
      return () => {
        navigation.navigate(Routes.ForgotPassword, {
          phone: values.phone,
        })
      }
    },
    [navigation],
  )

  const handleSubmitPhone = useCallback(() => {
    passwordRef.current.focus()
  }, [])

  const renderForm = useCallback(
    ({ values, submitting, handleSubmit }) => {
      return (
        <Inner>
          <Content>
            <FormField
              name="phone"
              component={FormTextInput}
              keyboardType="phone-pad"
              label={i18n.t('screen.signIn.form.label.phone')}
              placeholder={i18n.t('screen.signIn.form.placeholder.phone')}
              autoCapitalize="none"
              returnKeyType="next"
              mb={5}
              blurOnSubmit={false}
              onSubmitEditing={handleSubmitPhone}
            />

            <FormField
              innerRef={passwordRef}
              name="password"
              component={FormTextInput}
              label={i18n.t('screen.signIn.form.label.password')}
              placeholder={i18n.t('screen.signIn.form.placeholder.password')}
              autoCapitalize="none"
              returnKeyType="go"
              secureTextEntry
            />
          </Content>

          <Footer>
            <Button
              title={i18n.t('screen.signIn.button.signIn')}
              mb={6}
              isProgress={submitting}
              onPress={handleSubmit}
            />

            <ForgotPassword onPress={handleForgotPassword(values)}>
              {i18n.t('screen.signIn.button.forgotPassword')}
            </ForgotPassword>
          </Footer>
        </Inner>
      )
    },
    [handleForgotPassword, handleSubmitPhone],
  )

  return (
    <Container>
      <Scrollable fromTop toBottom>
        <Top>
          <LogoContainer>
            <Logo />
          </LogoContainer>

          <TabBar
            tabs={[
              { id: TAB_HASH.SIGN_IN, label: i18n.t('screen.signIn.phrase.signIn') },
              { id: TAB_HASH.SIGN_UP, label: i18n.t('screen.signIn.phrase.signUp') },
            ]}
            activeId={TAB_HASH.SIGN_IN}
            isFluid={false}
            onTabChange={handleTabChange}
          />
        </Top>

        <Middle>
          <Title>{i18n.t('screen.signIn.phrase.bfast')}</Title>
          <Description>{i18n.t('screen.signIn.phrase.importantApp')}</Description>
          <Instruction>{instruction}</Instruction>
        </Middle>

        <Bottom>
          <Form {...{ validate, initialValues, onSubmit }} render={renderForm} />
        </Bottom>
      </Scrollable>
    </Container>
  )
}

SignInScreen.propTypes = {
  navigation: ReactNavigationPropTypes.navigation.isRequired,
}

export { SignInScreen }
