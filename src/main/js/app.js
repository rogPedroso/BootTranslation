'use strict';

const React = require('react'); // <1>
const ReactDOM = require('react-dom'); // <2>
const when = require('when');
const client = require('./client'); // <3>

const follow = require('./follow'); // function to hop multiple links by "rel"

const root = '/api';


class App extends React.Component { // <1>

	constructor(props) {
		super(props);
		this.state = {translations: [], attributes: [], pageSize: 2, links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onTeste = this.onTeste.bind(this);
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
				this.links = translationCollection.entity._links;
				return translationCollection;
			});
		}).then(translationCollection => { // <3>
			return translationCollection.entity._embedded.translations.map(translation =>
					client({
						method: 'GET',
						path: translation._links.self.href
					})
			);
		}).then(translationPromises => { // <4>
			return when.all(translationPromises);
		}).done(translations => {
			this.setState({
				translations: translations,
				attributes: Object.keys(this.schema.properties),
				pageSize: pageSize,
				links: this.links});
		});
	}
	// end::follow-2[]

	// tag::create[]
	onCreate(newTranslation) {
		const self = this;
		follow(client, root, ['translations']).then(response => {
			return client({
				method: 'POST',
				path: response.entity._links.self.href,
				entity: newTranslation,
				headers: {'Content-Type': 'application/json'}
			})
		}).then(response => {
			return follow(client, root, [
				{rel: 'translations', params: {'size': self.state.pageSize}}]);
		}).done(response => {
			if (typeof response.entity._links.last !== "undefined") {
				this.onNavigate(response.entity._links.last.href);
			} else {
				this.onNavigate(response.entity._links.self.href);
			}
		});
	}
	// end::create[]

	onUpdate(translation, updatedTranslation) {
		client({
			method: 'PUT',
			path: translation.entity._links.self.href,
			entity: updatedTranslation,
			headers: {
				'Content-Type': 'application/json' //,
				//'If-Match': translation.headers.Etag
			}
		}).done(response => {
			this.loadFromServer(this.state.pageSize);
		}, response => {
			if (response.status.code === 412) {
				alert('DENIED: Unable to update ' +
				translation.entity._links.self.href + '. Your copy is stale.');
			}
		});
	}
	// end::update[]

	onTeste(translation, updatedTranslation) {
		console.log("Teste");
		client({
			method: 'PUT',
			path: translation.entity._links.self.href,
			entity: updatedTranslation,
			headers: {
				'Content-Type': 'application/json' //,
				//'If-Match': translation.headers.Etag
			}
		}).done(response => {
			//this.loadFromServer(this.state.pageSize);
		}, response => {
			if (response.status.code === 412) {
				alert('DENIED: Unable to update ' +
				translation.entity._links.self.href + '. Your copy is stale.');
			}
		});
	}
	// end::update[]

	// tag::delete[]
	onDelete(translation) {
		client({method: 'DELETE', path: translation.entity._links.self.href}).done(response => {
			this.loadFromServer(this.state.pageSize);
		});
	}
	// end::delete[]

	// tag::navigate[]
	onNavigate(navUri) {
		client({
			method: 'GET', 
			path: navUri
		}).then(translationCollection => {
			this.links = translationCollection.entity._links;

			return translationCollection.entity._embedded.translations.map(translation =>
					client({
						method: 'GET',
						path: translation._links.self.href
					})
			);
		}).then(translationPromises => {
			return when.all(translationPromises);
		}).done(translations => {
			this.setState({
				translations: translations,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
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
				<CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
				<TesteDialog attributes={this.state.attributes} onTeste={this.onTeste}/>
				<TranslationList translations={this.state.translations}
							  links={this.state.links}
							  pageSize={this.state.pageSize}
							  attributes={this.state.attributes}
							  onNavigate={this.onNavigate}
							  onUpdate={this.onUpdate}
							  onDelete={this.onDelete}
							  updatePageSize={this.updatePageSize}/>
			</div>
		)
	}
}
// end::app[]


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

class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	ajustaAtributos(atributos) {
		return ["exppt", "expen", "frasept", "fraseen","respondido", "acerto"];
	}

	handleSubmit(e) {
		e.preventDefault();
		const updatedTranslation = {};
		this.props.attributes.forEach(attribute => {
			updatedTranslation[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
			//console.log(attribute + ' **** ' + updatedTranslation[attribute]);
		});
		this.props.onUpdate(this.props.translation, updatedTranslation);
		window.location = "#";
	}

	render() {
		//const inputs = this.props.attributes.map(attribute =>
		const inputs = this.ajustaAtributos(this.props.attributes).map(attribute =>
			<p key={this.props.translation.entity[attribute]}>
				<input type="text" placeholder={attribute}
					   defaultValue={this.props.translation.entity[attribute]}
					   ref={attribute} className="field"/>
			</p>
		);

		const dialogId = "updateTranslation-" + this.props.translation.entity._links.self.href;

		return (
			<div key={this.props.translation.entity._links.self.href}>
				<a href={"#" + dialogId}><button>Update</button></a>
				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Update an translation</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Update</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

};

class TesteDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const testeTranslation = {};
		this.props.attributes.forEach(attribute => {
			if (attribute == 'respondido' || attribute == 'acerto') {
				testeTranslation[attribute] = 'false';
			}
			else {
				testeTranslation[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
			}
		});
		this.props.onTeste(testeTranslation);

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

		return (
			<div>
				<a href="#testeTranslation"><button>Teste</button></a>

				<div id="testeTranslation" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Teste de tradução</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Teste</button>
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
			<Translation key={translation.entity._links.self.href} 
						 translation={translation} 
						 attributes={this.props.attributes}
						 onUpdate={this.props.onUpdate}
						 onDelete={this.props.onDelete}/>
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
			<tr key={this.props.translation.entity.id}>
				<td>{this.props.translation.entity.exppt}</td>
				<td>{this.props.translation.entity.expen}</td>
				<td>{this.props.translation.entity.frasept}</td>
				<td>{this.props.translation.entity.fraseen}</td>
                <td>{this.props.translation.entity.respondido.toString()}</td>
                <td>{this.props.translation.entity.acerto.toString()}</td>
				<td>
					<UpdateDialog translation={this.props.translation}
								  attributes={this.props.attributes}
								  onUpdate={this.props.onUpdate}/>
				</td>
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
