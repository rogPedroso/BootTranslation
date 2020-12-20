'use strict';

const React = require('react'); // <1>
const ReactDOM = require('react-dom'); // <2>
const client = require('./client'); // <3>

const follow = require('./follow'); // function to hop multiple links by "rel"

const root = '/api';


class App extends React.Component { // <1>

	constructor(props) {
		super(props);
		this.state = {translations: [], attributes: [], pageSize: 2, links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
	}

	loadFromServer(pageSize) {
		follow(client, root, [
			{rel: 'translations', params: {size: pageSize}}]
		).then(translationCollection => {
			return client({
				method: 'GET',
				path: translationCollection.entity._links.profile.href,
				headers: {'Accept': 'application/schema+json'}
			}).then(schema => {
				this.schema = schema.entity;
				return translationCollection;
			});
		}).done(translationCollection => {
			this.setState({
				translations: translationCollection.entity._embedded.translations,
				attributes: Object.keys(this.schema.properties),
				pageSize: pageSize,
				links: translationCollection.entity._links});
		});
	}
	// end::follow-2[]

	// tag::create[]
	onCreate(newTranslation) {
		follow(client, root, ['translations']).then(translationCollection => {
			return client({
				method: 'POST',
				path: translationCollection.entity._links.self.href,
				entity: newTranslation,
				headers: {'Content-Type': 'application/json'}
			})
		}).then(response => {
			return follow(client, root, [
				{rel: 'translations', params: {'size': this.state.pageSize}}]);
		}).done(response => {
			if (typeof response.entity._links.last !== "undefined") {
				this.onNavigate(response.entity._links.last.href);
			} else {
				this.onNavigate(response.entity._links.self.href);
			}
		});
	}
	// end::create[]

	// tag::delete[]
	onDelete(translation) {
		client({method: 'DELETE', path: translation._links.self.href}).done(response => {
			this.loadFromServer(this.state.pageSize);
		});
	}
	// end::delete[]

	// tag::navigate[]
	onNavigate(navUri) {
		client({method: 'GET', path: navUri}).done(translationCollection => {
			this.setState({
				translations: translationCollection.entity._embedded.translations,
				attributes: this.state.attributes,
				pageSize: this.state.pageSize,
				links: translationCollection.entity._links
			});
		});
	}
	// end::navigate[]

	// tag::update-page-size[]
	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize);
		}
	}
	// end::update-page-size[]

	// tag::follow-1[]
	componentDidMount() {
		this.loadFromServer(this.state.pageSize);
	}
	// end::follow-1[]

	render() {
		return (
			<div>
				<CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>  <CreateTeste attributes={this.state.attributes} onTeste={this.onTeste}/>
				<TranslationList translations={this.state.translations}
							  links={this.state.links}
							  pageSize={this.state.pageSize}
							  onNavigate={this.onNavigate}
							  onDelete={this.onDelete}
							  updatePageSize={this.updatePageSize}/>
			</div>
		)
	}


/*

	componentDidMount() { // <2>
		client({method: 'GET', path: '/api/translations'}).done(response => {
			this.setState({translations: response.entity._embedded.translations});
		});
	}

	render() { // <3>
		return (
			<TranslationList translations={this.state.translations}/>
		)
	}
*/
}
// end::app[]

class CreateTeste extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const newTranslation = {};
		this.props.attributes.forEach(attribute => {
			if (attribute == 'respondido' || attribute == 'acerto') {
				newTranslation[attribute] = 'false';
			}
			else {
				newTranslation[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
			}
		});
		this.props.onCreate(newTranslation);

		// clear out the dialog's inputs
		this.props.attributes.forEach(attribute => {
			if (attribute != 'respondido' && attribute != 'acerto') {
				ReactDOM.findDOMNode(this.refs[attribute]).value = '';
			}
		});

		// Navigate away from the dialog to hide it.
		//window.location = "#";
	}

	render() {

		var attribs = [
            {
                cod: 'exppt',
                descricao: 'Expressão PT'
            },
            {
                cod: 'expen',
                descricao: 'Expressão EN'
            },
            {
                cod: 'frasept',
                descricao: 'Frase PT'
            },
            {
                cod: 'fraseen',
                descricao: 'Frase EN'
            }
          ];

		
		const inputs = attribs.map(campo =>
			<p key={campo.cod}>
				<input type="text" placeholder={campo.descricao} ref={campo.cod} className="field"/>
			</p>
		);
		

		/*
		const inputs = this.props.attributes.map(attribute =>
			<p key={attribute}>
				<input type="text" placeholder={'Digite ' + attribute} ref={attribute} className="field"/>
			</p>
		);
		*/

		return (
			<div>
				<a href="#createTeste"><button>Teste</button></a>

				<div id="createTeste" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Cadastro de nova tradução</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

}



class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const newTranslation = {};
		this.props.attributes.forEach(attribute => {
			if (attribute == 'respondido' || attribute == 'acerto') {
				newTranslation[attribute] = 'false';
			}
			else {
				newTranslation[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
			}
		});
		this.props.onCreate(newTranslation);

		// clear out the dialog's inputs
		this.props.attributes.forEach(attribute => {
			if (attribute != 'respondido' && attribute != 'acerto') {
				ReactDOM.findDOMNode(this.refs[attribute]).value = '';
			}
		});

		// Navigate away from the dialog to hide it.
		//window.location = "#";
	}

	render() {

		var attribs = [
            {
                cod: 'exppt',
                descricao: 'Expressão PT'
            },
            {
                cod: 'expen',
                descricao: 'Expressão EN'
            },
            {
                cod: 'frasept',
                descricao: 'Frase PT'
            },
            {
                cod: 'fraseen',
                descricao: 'Frase EN'
            }
          ];

		
		const inputs = attribs.map(campo =>
			<p key={campo.cod}>
				<input type="text" placeholder={campo.descricao} ref={campo.cod} className="field"/>
			</p>
		);
		

		/*
		const inputs = this.props.attributes.map(attribute =>
			<p key={attribute}>
				<input type="text" placeholder={'Digite ' + attribute} ref={attribute} className="field"/>
			</p>
		);
		*/

		return (
			<div>
				<a href="#createTranslation"><button>Create</button></a>

				<div id="createTranslation" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Cadastro de nova tradução</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

}


// tag::translation-list[]
class TranslationList extends React.Component{

	constructor(props) {
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
		this.handleInput = this.handleInput.bind(this);
	}

	// tag::handle-page-size-updates[]
	handleInput(e) {
		e.preventDefault();
		const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(pageSize);
		} else {
			ReactDOM.findDOMNode(this.refs.pageSize).value =
				pageSize.substring(0, pageSize.length - 1);
		}
	}
	// end::handle-page-size-updates[]

	// tag::handle-nav[]
	handleNavFirst(e){
		e.preventDefault();
		this.props.onNavigate(this.props.links.first.href);
	}

	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}

	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}

	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}
	// end::handle-nav[]

	render() {
		const translations = this.props.translations.map(translation =>
			<Translation key={translation._links.self.href} translation={translation} onDelete={this.props.onDelete}/>
		);

		const navLinks = [];
		if ("first" in this.props.links) {
			navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
		}
		if ("prev" in this.props.links) {
			navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
		}
		if ("next" in this.props.links) {
			navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
		}
		if ("last" in this.props.links) {
			navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
		}


		return (
			<div>
				<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
				<table>
					<tbody>
						<tr>
							<th>Express&atilde;o PT</th>
							<th>Express&atilde;o EN</th>
							<th>Frase PT</th>
							<th>Frase EN</th>
							<th>Respondido</th>
							<th>Acerto</th>
							<th></th>
						</tr>
						{translations}
					</tbody>
				</table>
				<div>
					{navLinks}
				</div>
			</div>
		)
	}
}
// end::translation-list[]

// tag::translation[]
class Translation extends React.Component{

	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete() {
		this.props.onDelete(this.props.translation);
	}

	render() {
		return (
			<tr key={this.props.translation.id}>
				<td>{this.props.translation.exppt}</td>
				<td>{this.props.translation.expen}</td>
				<td>{this.props.translation.frasept}</td>
				<td>{this.props.translation.fraseen}</td>
                <td>{this.props.translation.respondido.toString()}</td>
                <td>{this.props.translation.acerto.toString()}</td>
				<td>
					<button onClick={this.handleDelete}>Delete</button>
				</td>
			</tr>
		)
	}
}
// end::translation[]

// tag::render[]
ReactDOM.render(
	<App />,
	document.getElementById('react')
)
// end::render[]
