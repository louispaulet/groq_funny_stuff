import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-64 grid place-items-center text-sm text-red-600 dark:text-red-400">
          Failed to render 3D preview.
        </div>
      )
    }
    return this.props.children
  }
}
